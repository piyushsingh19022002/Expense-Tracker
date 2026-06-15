import prisma from '../config/prisma.js';
import { createCsvImport } from '../services/importService.js';
import { getBatchAnomalies, updateAnomalyStatus } from '../services/anomalyDetectionService.js';
import * as groupService from '../services/group.service.js';
import * as expenseService from '../services/expense.service.js';
import assert from 'assert';

const CREATOR_EMAIL = 'anomaly.creator@example.com';
const MEMBER_EMAIL = 'anomaly.member@example.com';
const FORMER_EMAIL = 'anomaly.former@example.com';

async function setupTestData() {
  console.log('Setting up test users and group...');

  // 1. Create or fetch test users
  let creator = await prisma.user.findUnique({ where: { email: CREATOR_EMAIL } });
  if (!creator) {
    creator = await prisma.user.create({
      data: { email: CREATOR_EMAIL, name: 'Anomaly Creator', password: 'DummyPassword123' }
    });
  }

  let member = await prisma.user.findUnique({ where: { email: MEMBER_EMAIL } });
  if (!member) {
    member = await prisma.user.create({
      data: { email: MEMBER_EMAIL, name: 'Active Member', password: 'DummyPassword123' }
    });
  }

  let former = await prisma.user.findUnique({ where: { email: FORMER_EMAIL } });
  if (!former) {
    former = await prisma.user.create({
      data: { email: FORMER_EMAIL, name: 'Former Member', password: 'DummyPassword123' }
    });
  }

  // 2. Create test group
  const groupName = 'Test Anomaly Group ' + Date.now();
  const { group } = await groupService.createGroup(groupName, 'Testing anomaly detection', creator.id);
  console.log(`Created group: ${group.name} (${group.id})`);

  // 3. Add members
  await groupService.addMember(group.id, MEMBER_EMAIL, creator.id);
  await groupService.addMember(group.id, FORMER_EMAIL, creator.id);

  // 4. Soft-delete the former member so status becomes LEFT
  await groupService.removeMember(group.id, former.id, creator.id);
  console.log('Added members and soft-deleted former.member@example.com (status: LEFT).');

  // 5. Pre-seed a historical expense to test database duplicate matching
  // Row 1 matches: Team Pizza, 2026-06-10, 50.00 USD, paid by active member
  const expData = {
    description: 'Team Pizza',
    amount: 50.00,
    currency: 'USD',
    date: new Date('2026-06-10'),
    paidById: member.id,
    participants: [
      { userId: creator.id },
      { userId: member.id }
    ]
  };
  await expenseService.createExpense(group.id, expData, creator.id);
  console.log('Pre-seeded historical database expense: "Team Pizza" for 50.00 USD.');

  return { creator, member, former, group };
}

async function runTests() {
  console.log('--- Starting CSV Anomaly Detection Engine Tests ---');
  const { creator, member, former, group } = await setupTestData();

  // Create a CSV string containing rows designed to trigger all 8 anomaly checks
  // Row 1: Duplicate against DB historical expense
  // Row 2 & 3: Duplicates of each other in the same batch
  // Row 4: Invalid date
  // Row 5: Ambiguous date
  // Row 6: Missing currency
  // Row 7: Negative amount
  // Row 8: Unknown member (payer)
  // Row 9: Former member (payer)
  // Row 10: Unknown member (split participant)
  // Row 11: Former member (split participant)
  // Row 12: Settlement logged as expense
  const csvContent = `Description,Date,Amount,Currency,Paid By,Split Between
Team Pizza,2026-06-10,50.00,USD,anomaly.member@example.com,anomaly.creator@example.com; anomaly.member@example.com
Office Coffee,2026-06-11,10.00,USD,anomaly.member@example.com,anomaly.creator@example.com
Office Coffee,2026-06-11,10.00,USD,anomaly.member@example.com,anomaly.creator@example.com
Office Supplies,Invalid Date String,15.00,USD,anomaly.member@example.com,anomaly.creator@example.com
Taxi Ride,06/07/2026,30.00,USD,anomaly.member@example.com,anomaly.creator@example.com
Weekly Donuts,2026-06-11,8.50,,anomaly.member@example.com,anomaly.creator@example.com
Refund for lunch,2026-06-11,-25.00,USD,anomaly.member@example.com,anomaly.creator@example.com
Dinner with Client,2026-06-12,120.00,USD,unknown.guy@example.com,anomaly.creator@example.com
Farewell Gift,2026-06-12,40.00,USD,anomaly.former@example.com,anomaly.creator@example.com
Party Snacks,2026-06-12,40.00,USD,anomaly.member@example.com,unknown.guy@example.com
Group Dinner,2026-06-12,40.00,USD,anomaly.member@example.com,anomaly.former@example.com
settlement payback of balance,2026-06-13,35.00,USD,anomaly.member@example.com,anomaly.creator@example.com`;

  const file = {
    originalname: 'test_anomalies.csv',
    buffer: Buffer.from(csvContent)
  };

  console.log('\nUploading CSV file and running anomaly engine...');
  const importResult = await createCsvImport({
    file,
    uploadedById: creator.id,
    groupId: group.id
  });

  console.log(`CSV Upload completed. Batch ID: ${importResult.importBatchId}`);
  console.log(`Total parsed rows: ${importResult.totalRows}`);
  console.log(`Total anomalies returned in upload payload: ${importResult.anomalies.length}`);

  // Fetch anomalies directly from DB to verify persistence
  const anomalies = await getBatchAnomalies(importResult.importBatchId);
  console.log(`Stored anomalies in DB: ${anomalies.length}`);

  // Validate presence of specific anomaly types
  const getAnomaliesByType = (type) => anomalies.filter(a => a.anomalyType === type);

  // 1. DUPLICATE_EXPENSE
  const duplicates = getAnomaliesByType('DUPLICATE_EXPENSE');
  console.log(`- DUPLICATE_EXPENSE count: ${duplicates.length}`);
  assert.ok(duplicates.length >= 3, 'Should detect database duplicate and batch duplicate rows');
  assert.ok(duplicates.some(d => d.description.includes('existing historical expense')), 'Should catch DB duplicate');
  assert.ok(duplicates.some(d => d.description.includes('duplicate of other row')), 'Should catch batch duplicate');

  // 2. INVALID_DATE
  const invalidDates = getAnomaliesByType('INVALID_DATE');
  console.log(`- INVALID_DATE count: ${invalidDates.length}`);
  assert.strictEqual(invalidDates.length, 1);
  assert.strictEqual(invalidDates[0].severity, 'CRITICAL');
  assert.strictEqual(invalidDates[0].rowNumber, 5);

  // 3. AMBIGUOUS_DATE
  const ambiguousDates = getAnomaliesByType('AMBIGUOUS_DATE');
  console.log(`- AMBIGUOUS_DATE count: ${ambiguousDates.length}`);
  assert.strictEqual(ambiguousDates.length, 1);
  assert.strictEqual(ambiguousDates[0].severity, 'MEDIUM');
  assert.strictEqual(ambiguousDates[0].rowNumber, 6);

  // 4. MISSING_CURRENCY
  const missingCurrencies = getAnomaliesByType('MISSING_CURRENCY');
  console.log(`- MISSING_CURRENCY count: ${missingCurrencies.length}`);
  assert.strictEqual(missingCurrencies.length, 1);
  assert.strictEqual(missingCurrencies[0].severity, 'LOW');
  assert.strictEqual(missingCurrencies[0].rowNumber, 7);

  // 5. NEGATIVE_AMOUNT
  const negativeAmounts = getAnomaliesByType('NEGATIVE_AMOUNT');
  console.log(`- NEGATIVE_AMOUNT count: ${negativeAmounts.length}`);
  assert.strictEqual(negativeAmounts.length, 1);
  assert.strictEqual(negativeAmounts[0].severity, 'HIGH');
  assert.strictEqual(negativeAmounts[0].rowNumber, 8);

  // 6. UNKNOWN_MEMBER
  const unknownMembers = getAnomaliesByType('UNKNOWN_MEMBER');
  console.log(`- UNKNOWN_MEMBER count: ${unknownMembers.length}`);
  // Should detect unknown guy as payer in row 8 and unknown guy as participant in row 10
  assert.strictEqual(unknownMembers.length, 2);
  assert.ok(unknownMembers.every(u => u.severity === 'CRITICAL'));

  // 7. FORMER_MEMBER
  const formerMembers = getAnomaliesByType('FORMER_MEMBER');
  console.log(`- FORMER_MEMBER count: ${formerMembers.length}`);
  // Should detect former member as payer in row 9 and former member as participant in row 11
  assert.strictEqual(formerMembers.length, 2);
  assert.ok(formerMembers.every(f => f.severity === 'HIGH'));

  // 8. SETTLEMENT_LOGGED_AS_EXPENSE
  const settlements = getAnomaliesByType('SETTLEMENT_LOGGED_AS_EXPENSE');
  console.log(`- SETTLEMENT_LOGGED_AS_EXPENSE count: ${settlements.length}`);
  assert.strictEqual(settlements.length, 1);
  assert.strictEqual(settlements[0].severity, 'MEDIUM');
  assert.strictEqual(settlements[0].rowNumber, 13);

  console.log('✔ All 8 anomaly detection checks verified successfully.');

  // Test updating status
  console.log('\nTesting anomaly review status modification...');
  const targetAnomaly = anomalies[0];
  console.log(`Modifying status of anomaly ID ${targetAnomaly.id} (Type: ${targetAnomaly.anomalyType}) from PENDING to APPROVED`);
  
  const approvedAnomaly = await updateAnomalyStatus(targetAnomaly.id, 'APPROVED');
  assert.strictEqual(approvedAnomaly.status, 'APPROVED');
  console.log('✔ Anomaly status successfully updated to APPROVED.');

  const rejectedAnomaly = await updateAnomalyStatus(targetAnomaly.id, 'REJECTED');
  assert.strictEqual(rejectedAnomaly.status, 'REJECTED');
  console.log('✔ Anomaly status successfully updated to REJECTED.');

  console.log('\n--- All CSV Anomaly Engine tests passed successfully! 🎉 ---');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
