import prisma from '../config/prisma.js';
import { createCsvImport } from '../services/importService.js';
import { approveAnomaly, rejectAnomaly, editAnomalyRow } from '../services/anomalyReviewService.js';
import { generateImportReport } from '../services/importReportService.js';
import * as groupService from '../services/group.service.js';
import assert from 'assert';

const REVIEWER_EMAIL = 'reviewer@example.com';

async function setupTestData() {
  console.log('Setting up anomaly review test data...');

  // 1. Create or fetch test user
  let reviewer = await prisma.user.findUnique({ where: { email: REVIEWER_EMAIL } });
  if (!reviewer) {
    reviewer = await prisma.user.create({
      data: { email: REVIEWER_EMAIL, name: 'Workflow Reviewer', password: 'Password123' }
    });
  }

  // 2. Create test group
  const groupName = 'Test Review Group ' + Date.now();
  const { group } = await groupService.createGroup(groupName, 'Testing review workflow', reviewer.id);
  console.log(`Created group: ${group.name} (${group.id})`);

  return { reviewer, group };
}

async function runTests() {
  console.log('--- Starting CSV Anomaly Review Workflow Tests ---');
  const { reviewer, group } = await setupTestData();

  // CSV content with 3 rows:
  // Row 1: Healthy Lunch (no anomalies)
  // Row 2: Invalid Date (triggers INVALID_DATE critical anomaly)
  // Row 3: Negative Amount (triggers NEGATIVE_AMOUNT high anomaly)
  const csvContent = `Description,Date,Amount,Currency,Paid By,Split Between
Healthy Lunch,2026-06-14,24.50,USD,reviewer@example.com,reviewer@example.com
Office Coffee,Invalid Date String,15.00,USD,reviewer@example.com,reviewer@example.com
Refund for Uber,2026-06-15,-30.00,USD,reviewer@example.com,reviewer@example.com`;

  const file = {
    originalname: 'test_review_workflow.csv',
    buffer: Buffer.from(csvContent)
  };

  console.log('\nUploading CSV file and running anomaly detection...');
  const importResult = await createCsvImport({
    file,
    uploadedById: reviewer.id,
    groupId: group.id
  });

  const batchId = importResult.importBatchId;
  console.log(`Batch created: ${batchId}`);

  // Fetch pending anomalies from database
  const anomalies = await prisma.importAnomaly.findMany({
    where: { importBatchId: batchId }
  });
  console.log(`Anomalies detected: ${anomalies.length}`);

  const invalidDateAnomaly = anomalies.find(a => a.anomalyType === 'INVALID_DATE');
  const negativeAmountAnomaly = anomalies.find(a => a.anomalyType === 'NEGATIVE_AMOUNT');

  assert.ok(invalidDateAnomaly);
  assert.ok(negativeAmountAnomaly);

  // Test 1: Approve Anomaly
  console.log(`\nTesting approveAnomaly() for ID ${invalidDateAnomaly.id}...`);
  const approved = await approveAnomaly(invalidDateAnomaly.id);
  assert.strictEqual(approved.status, 'APPROVED');
  console.log('✔ Anomaly status successfully set to APPROVED.');

  // Test 2: Reject Anomaly
  console.log(`\nTesting rejectAnomaly() for ID ${negativeAmountAnomaly.id}...`);
  const rejected = await rejectAnomaly(negativeAmountAnomaly.id);
  assert.strictEqual(rejected.status, 'REJECTED');
  console.log('✔ Anomaly status successfully set to REJECTED.');

  // Test 3: Edit Row Data & Validate Audit Trail (using the invalid date anomaly as a target)
  const originalRow = await prisma.importRow.findUnique({
    where: {
      importBatchId_rowNumber: {
        importBatchId: batchId,
        rowNumber: invalidDateAnomaly.rowNumber
      }
    }
  });
  
  assert.strictEqual(originalRow.correctedData, null);
  assert.strictEqual(originalRow.data.Date, 'Invalid Date String');

  // Perform correction to row values
  const correctedPayload = {
    ...originalRow.data,
    Date: '2026-06-15' // Fixing the invalid date
  };

  console.log(`\nTesting editAnomalyRow() for Row ${invalidDateAnomaly.rowNumber}...`);
  const editResult = await editAnomalyRow(invalidDateAnomaly.id, correctedPayload, reviewer.id);

  const updatedAnomaly = editResult.anomaly;
  const updatedRow = editResult.row;

  // Validate original row is preserved
  assert.strictEqual(updatedRow.data.Date, 'Invalid Date String', 'Original CSV data must be preserved');
  assert.strictEqual(updatedRow.correctedData.Date, '2026-06-15', 'Corrected data must be stored separately');

  // Validate audit trail/history on anomaly
  assert.ok(Array.isArray(updatedAnomaly.history));
  assert.strictEqual(updatedAnomaly.history.length, 1);

  const historyLog = updatedAnomaly.history[0];
  assert.strictEqual(historyLog.editedById, reviewer.id);
  assert.ok(historyLog.changedFields.Date);
  assert.strictEqual(historyLog.changedFields.Date.oldValue, 'Invalid Date String');
  assert.strictEqual(historyLog.changedFields.Date.newValue, '2026-06-15');
  console.log('✔ Corrected values stored separately and audit trail verified.');

  // Test 4: Verify that report is dynamically updated
  console.log('\nFetching updated import report (after edit, before re-approval)...');
  let report = await generateImportReport(batchId, reviewer.id);

  // Healthy Lunch (Row 2): no anomalies -> Imported (1)
  // Office Coffee (Row 3): invalid date anomaly edit reset it to PENDING -> Pending (1)
  // Refund for Uber (Row 4): negative amount anomaly rejected -> Failed/Rejected (1)
  // Totals: imported: 1, rejected: 1, pendingReview: 1
  assert.strictEqual(report.actionsTaken.imported, 1);
  assert.strictEqual(report.actionsTaken.rejected, 1);
  assert.strictEqual(report.actionsTaken.pendingReview, 1);

  assert.strictEqual(report.importedRows.length, 1);
  assert.strictEqual(report.failedRows.length, 1);
  assert.strictEqual(report.pendingRows.length, 1);
  console.log('✔ Import Report classification correctly reflects pending state after edit.');

  // Re-approve the anomaly after correction
  console.log('\nRe-approving anomaly after correction...');
  await approveAnomaly(invalidDateAnomaly.id);

  console.log('Fetching report after final re-approval...');
  report = await generateImportReport(batchId, reviewer.id);

  // Now: Healthy Lunch (Imported), Office Coffee (Approved -> Imported), Refund (Rejected -> Failed)
  // Totals: imported: 2, rejected: 1, pendingReview: 0
  assert.strictEqual(report.actionsTaken.imported, 2);
  assert.strictEqual(report.actionsTaken.rejected, 1);
  assert.strictEqual(report.actionsTaken.pendingReview, 0);

  assert.strictEqual(report.importedRows.length, 2);
  assert.strictEqual(report.failedRows.length, 1);
  assert.strictEqual(report.pendingRows.length, 0);
  console.log('✔ Import Report classification correctly reflects final approved state.');

  console.log('\n--- All CSV Anomaly Review Workflow tests passed successfully! 🎉 ---');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
