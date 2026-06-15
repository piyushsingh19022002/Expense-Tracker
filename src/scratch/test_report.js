import prisma from '../config/prisma.js';
import { createCsvImport } from '../services/importService.js';
import { generateImportReport } from '../services/importReportService.js';
import { updateAnomalyStatus } from '../services/anomalyDetectionService.js';
import * as groupService from '../services/group.service.js';
import assert from 'assert';

const UPLOADER_EMAIL = 'report.uploader@example.com';
const MEMBER_EMAIL = 'report.member@example.com';
const STRANGER_EMAIL = 'report.stranger@example.com';

async function setupTestData() {
  console.log('Setting up report test data...');

  // 1. Create or fetch test users
  let uploader = await prisma.user.findUnique({ where: { email: UPLOADER_EMAIL } });
  if (!uploader) {
    uploader = await prisma.user.create({
      data: { email: UPLOADER_EMAIL, name: 'Report Uploader', password: 'Password123' }
    });
  }

  let member = await prisma.user.findUnique({ where: { email: MEMBER_EMAIL } });
  if (!member) {
    member = await prisma.user.create({
      data: { email: MEMBER_EMAIL, name: 'Group Member', password: 'Password123' }
    });
  }

  let stranger = await prisma.user.findUnique({ where: { email: STRANGER_EMAIL } });
  if (!stranger) {
    stranger = await prisma.user.create({
      data: { email: STRANGER_EMAIL, name: 'Group Stranger', password: 'Password123' }
    });
  }

  // 2. Create test group
  const groupName = 'Test Report Group ' + Date.now();
  const { group } = await groupService.createGroup(groupName, 'Testing report generation', uploader.id);
  console.log(`Created group: ${group.name} (${group.id})`);

  // 3. Add uploader and member to group
  await groupService.addMember(group.id, MEMBER_EMAIL, uploader.id);
  console.log('uploader and member joined group.');

  return { uploader, member, stranger, group };
}

async function runTests() {
  console.log('--- Starting CSV Import Report Generation Tests ---');
  const { uploader, member, stranger, group } = await setupTestData();

  // CSV content with 4 rows:
  // Row 1: Valid row (no anomalies)
  // Row 2: Invalid Date (triggers INVALID_DATE anomaly - severity: CRITICAL)
  // Row 3: Ambiguous Date (triggers AMBIGUOUS_DATE anomaly - severity: MEDIUM)
  // Row 4: Settlement keywords (triggers SETTLEMENT_LOGGED_AS_EXPENSE anomaly - severity: MEDIUM)
  const csvContent = `Description,Date,Amount,Currency,Paid By,Split Between
Healthy Lunch,2026-06-14,24.50,USD,report.uploader@example.com,report.uploader@example.com; report.member@example.com
Office Coffee Supplies,Invalid Date String,50.00,USD,report.uploader@example.com,report.uploader@example.com
Uber Ride to Client,06/07/2026,35.00,USD,report.uploader@example.com,report.uploader@example.com
repayment for dinner payback,2026-06-15,15.00,USD,report.uploader@example.com,report.uploader@example.com`;

  const file = {
    originalname: 'test_report_gen.csv',
    buffer: Buffer.from(csvContent)
  };

  console.log('\nUploading CSV file and creating batch...');
  const importResult = await createCsvImport({
    file,
    uploadedById: uploader.id,
    groupId: group.id
  });

  const batchId = importResult.importBatchId;
  console.log(`CSV parsed. Batch ID: ${batchId}`);

  // Test 1: Fetch report as uploader (should succeed)
  console.log('\nFetching report as batch uploader...');
  let report = await generateImportReport(batchId, uploader.id);

  console.log('Verifying summary section:');
  assert.strictEqual(report.summary.importBatchId, batchId);
  assert.strictEqual(report.summary.fileName, 'test_report_gen.csv');
  assert.strictEqual(report.summary.totalRows, 4);
  console.log('✔ Summary verified successfully.');

  console.log('\nVerifying initial row classification (all anomalies are PENDING):');
  // Row 1 (Healthy Lunch) has no anomalies -> should be in importedRows
  // Row 2, 3, 4 have pending anomalies -> should be in pendingRows
  // 0 rejected anomalies -> 0 failedRows
  assert.strictEqual(report.actionsTaken.imported, 1);
  assert.strictEqual(report.actionsTaken.rejected, 0);
  assert.strictEqual(report.actionsTaken.pendingReview, 3);

  assert.strictEqual(report.importedRows.length, 1);
  assert.strictEqual(report.importedRows[0].rowNumber, 2); // Line 2 of CSV
  assert.strictEqual(report.importedRows[0].data.Description, 'Healthy Lunch');

  assert.strictEqual(report.pendingRows.length, 3);
  assert.strictEqual(report.failedRows.length, 0);
  console.log('✔ Row classification counts verified successfully.');

  // Test 2: Fetch report as group member (should succeed)
  console.log('\nFetching report as active group member...');
  const memberReport = await generateImportReport(batchId, member.id);
  assert.strictEqual(memberReport.summary.importBatchId, batchId);
  console.log('✔ Active group member authorized successfully.');

  // Test 3: Fetch report as stranger (should fail with 403)
  console.log('\nFetching report as stranger (non-member)...');
  try {
    await generateImportReport(batchId, stranger.id);
    assert.fail('Stranger should have been denied access.');
  } catch (err) {
    assert.strictEqual(err.statusCode, 403);
    console.log('✔ Access correctly denied for stranger (403 Forbidden).');
  }

  // Test 4: Approve anomaly and review report update
  // Find the ambiguous date anomaly (should be on row index 5 / line 6)
  const ambiguousAnomaly = report.anomalies.find((a) => a.type === 'AMBIGUOUS_DATE');
  assert.ok(ambiguousAnomaly);

  // We need the database id of the anomaly to approve it
  const dbAnomalies = await prisma.importAnomaly.findMany({ where: { importBatchId: batchId } });
  const targetAnomaly = dbAnomalies.find((a) => a.anomalyType === 'AMBIGUOUS_DATE');

  console.log(`\nApproving AMBIGUOUS_DATE anomaly (ID: ${targetAnomaly.id}) on Row ${targetAnomaly.rowNumber}...`);
  await updateAnomalyStatus(targetAnomaly.id, 'APPROVED');

  console.log('Re-generating report to verify update...');
  report = await generateImportReport(batchId, uploader.id);

  // After approving the anomaly, row 3 (Taxi/Uber ride, Line 6) has all approved anomalies,
  // so it should move to importedRows!
  // Count change: imported: 2, pending: 2, rejected: 0
  assert.strictEqual(report.actionsTaken.imported, 2);
  assert.strictEqual(report.actionsTaken.pendingReview, 2);
  assert.strictEqual(report.actionsTaken.rejected, 0);

  // Verify that Row 4 is now in importedRows
  const isRow4Imported = report.importedRows.some((r) => r.rowNumber === 4);
  assert.ok(isRow4Imported, 'Row 4 should now be in importedRows');
  console.log('✔ Anomaly approval successfully updated row classification to IMPORTED.');

  // Test 5: Reject anomaly and review report update
  // Let's reject the settlement anomaly (row 4 / line 7)
  const settlementAnomaly = dbAnomalies.find((a) => a.anomalyType === 'SETTLEMENT_LOGGED_AS_EXPENSE');
  console.log(`\nRejecting SETTLEMENT_LOGGED_AS_EXPENSE anomaly (ID: ${settlementAnomaly.id}) on Row ${settlementAnomaly.rowNumber}...`);
  await updateAnomalyStatus(settlementAnomaly.id, 'REJECTED');

  console.log('Re-generating report to verify rejection update...');
  report = await generateImportReport(batchId, uploader.id);

  // Now, Row 5 has a rejected anomaly. It should move to failedRows!
  // Count change: imported: 2, pending: 1, rejected: 1
  assert.strictEqual(report.actionsTaken.imported, 2);
  assert.strictEqual(report.actionsTaken.pendingReview, 1);
  assert.strictEqual(report.actionsTaken.rejected, 1);

  assert.strictEqual(report.failedRows.length, 1);
  assert.strictEqual(report.failedRows[0].rowNumber, 5); // Line 5 of CSV
  assert.strictEqual(report.failedRows[0].data.Description, 'repayment for dinner payback');
  console.log('✔ Anomaly rejection successfully updated row classification to FAILED/REJECTED.');

  console.log('\n--- All CSV Import Report Generation tests passed successfully! 🎉 ---');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
