import prisma from '../config/prisma.js';
import { calculateUserBalance, calculateGroupBalances } from '../services/balanceService.js';
import * as groupService from '../services/group.service.js';
import * as expenseService from '../services/expense.service.js';
import assert from 'assert';

const TEST_CREATOR = 'balance.creator@example.com';
const TEST_MEMBER1 = 'balance.member1@example.com';
const TEST_MEMBER2 = 'balance.member2@example.com';

async function runTests() {
  console.log('--- Starting Balance Calculation Engine Tests ---');
  
  try {
    // 1. Setup/retrieve test users
    let creator = await prisma.user.findUnique({ where: { email: TEST_CREATOR } });
    if (!creator) {
      creator = await prisma.user.create({
        data: { email: TEST_CREATOR, name: 'Balance Creator', password: 'DummyPassword123' }
      });
    }

    let member1 = await prisma.user.findUnique({ where: { email: TEST_MEMBER1 } });
    if (!member1) {
      member1 = await prisma.user.create({
        data: { email: TEST_MEMBER1, name: 'Balance Member 1', password: 'DummyPassword123' }
      });
    }

    let member2 = await prisma.user.findUnique({ where: { email: TEST_MEMBER2 } });
    if (!member2) {
      member2 = await prisma.user.create({
        data: { email: TEST_MEMBER2, name: 'Balance Member 2', password: 'DummyPassword123' }
      });
    }

    // 2. Create test group
    const groupName = 'Test Balance Group ' + Date.now();
    const { group } = await groupService.createGroup(groupName, 'Testing user balances', creator.id);
    console.log(`Created group: ${group.name} (${group.id})`);

    // 3. Add members to the group
    await groupService.addMember(group.id, TEST_MEMBER1, creator.id);
    await groupService.addMember(group.id, TEST_MEMBER2, creator.id);
    console.log('Added members to the test group.');

    // 4. Log Expense 1: 90.00 USD, Paid by Creator, Split equally between Creator, Member 1, Member 2.
    // Creator: Paid = 90.00, Share = 30.00
    // Member 1: Paid = 0.00, Share = 30.00
    // Member 2: Paid = 0.00, Share = 30.00
    const exp1Data = {
      description: 'Team Dinner',
      amount: 90.00,
      currency: 'USD',
      date: new Date(),
      paidById: creator.id,
      participants: [
        { userId: creator.id },
        { userId: member1.id },
        { userId: member2.id }
      ]
    };
    await expenseService.createExpense(group.id, exp1Data, creator.id);
    console.log('Logged Expense 1 (90.00 USD, paid by Creator, split 3-ways).');

    // 5. Log Expense 2: 60.00 USD, Paid by Member 1, Split equally between Member 1, Member 2.
    // Member 1: Paid = 60.00, Share = 30.00
    // Member 2: Paid = 0.00, Share = 30.00
    const exp2Data = {
      description: 'Groceries',
      amount: 60.00,
      currency: 'USD',
      date: new Date(),
      paidById: member1.id,
      participants: [
        { userId: member1.id },
        { userId: member2.id }
      ]
    };
    await expenseService.createExpense(group.id, exp2Data, creator.id);
    console.log('Logged Expense 2 (60.00 USD, paid by Member 1, split 2-ways).');

    // 6. Test Single User Balance Calculations
    console.log('\nTesting calculateUserBalance()...');
    const balCreator = await calculateUserBalance(creator.id, group.id);
    const balMember1 = await calculateUserBalance(member1.id, group.id);
    const balMember2 = await calculateUserBalance(member2.id, group.id);

    console.log('Creator Balance:', balCreator);
    console.log('Member 1 Balance:', balMember1);
    console.log('Member 2 Balance:', balMember2);

    // Creator expected: Paid = 90.00, Share = 30.00, Net = +60.00
    assert.strictEqual(balCreator.totalPaid, 90.00);
    assert.strictEqual(balCreator.totalShare, 30.00);
    assert.strictEqual(balCreator.netBalance, 60.00);

    // Member 1 expected: Paid = 60.00, Share = 60.00 (30.00 + 30.00), Net = 0.00
    assert.strictEqual(balMember1.totalPaid, 60.00);
    assert.strictEqual(balMember1.totalShare, 60.00);
    assert.strictEqual(balMember1.netBalance, 0.00);

    // Member 2 expected: Paid = 0.00, Share = 60.00 (30.00 + 30.00), Net = -60.00
    assert.strictEqual(balMember2.totalPaid, 0.00);
    assert.strictEqual(balMember2.totalShare, 60.00);
    assert.strictEqual(balMember2.netBalance, -60.00);

    console.log('✔ Individual user balances verified successfully.');

    // 7. Test Group Balances Calculations
    console.log('\nTesting calculateGroupBalances()...');
    const groupBalances = await calculateGroupBalances(group.id);
    console.log('Group Balances Array:', groupBalances);

    assert.strictEqual(groupBalances.length, 3);
    const creatorRow = groupBalances.find(b => b.userId === creator.id);
    const m1Row = groupBalances.find(b => b.userId === member1.id);
    const m2Row = groupBalances.find(b => b.userId === member2.id);

    assert.ok(creatorRow);
    assert.strictEqual(creatorRow.netBalance, 60.00);

    assert.ok(m1Row);
    assert.strictEqual(m1Row.netBalance, 0.00);

    assert.ok(m2Row);
    assert.strictEqual(m2Row.netBalance, -60.00);

    // Assert sum of net balances in the group is exactly zero
    const balanceSum = groupBalances.reduce((sum, item) => sum + item.netBalance, 0);
    assert.strictEqual(balanceSum, 0);
    console.log('✔ Group balances matrix verified successfully (sums to exactly 0.00).');

    // 8. Verify soft-deleted members retention
    console.log('\nTesting member removal (soft-delete) balances retention...');
    await groupService.removeMember(group.id, member2.id, creator.id);
    console.log('Soft-deleted Member 2 from the group.');

    const groupBalancesAfterLeave = await calculateGroupBalances(group.id);
    console.log('Group Balances after Member 2 left:', groupBalancesAfterLeave);
    
    // Member 2 should still be listed in balances calculations since they have history
    const m2RowAfterLeave = groupBalancesAfterLeave.find(b => b.userId === member2.id);
    assert.ok(m2RowAfterLeave);
    assert.strictEqual(m2RowAfterLeave.netBalance, -60.00);
    console.log('✔ Soft-deleted member historical balance retained successfully.');

    console.log('\n--- All Balance Engine tests passed successfully! 🎉 ---');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
