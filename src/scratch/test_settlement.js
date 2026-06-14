import prisma from '../config/prisma.js';
import * as settlementService from '../services/settlementService.js';
import * as groupService from '../services/group.service.js';
import assert from 'assert';

const TEST_CREATOR = 'settle.creator@example.com';
const TEST_MEMBER1 = 'settle.member1@example.com';
const TEST_MEMBER2 = 'settle.member2@example.com';
const TEST_NONMEMBER = 'settle.nonmember@example.com';

async function runTests() {
  console.log('--- Starting Settlement Module Integration Tests ---');

  try {
    // 1. Setup test users
    let creator = await prisma.user.findUnique({ where: { email: TEST_CREATOR } });
    if (!creator) {
      creator = await prisma.user.create({
        data: { email: TEST_CREATOR, name: 'Settle Creator', password: 'DummyPassword123' }
      });
    }

    let member1 = await prisma.user.findUnique({ where: { email: TEST_MEMBER1 } });
    if (!member1) {
      member1 = await prisma.user.create({
        data: { email: TEST_MEMBER1, name: 'Settle Member 1', password: 'DummyPassword123' }
      });
    }

    let member2 = await prisma.user.findUnique({ where: { email: TEST_MEMBER2 } });
    if (!member2) {
      member2 = await prisma.user.create({
        data: { email: TEST_MEMBER2, name: 'Settle Member 2', password: 'DummyPassword123' }
      });
    }

    let nonMember = await prisma.user.findUnique({ where: { email: TEST_NONMEMBER } });
    if (!nonMember) {
      nonMember = await prisma.user.create({
        data: { email: TEST_NONMEMBER, name: 'Settle Non-Member', password: 'DummyPassword123' }
      });
    }

    // 2. Create test group
    const groupName = 'Test Settle Group ' + Date.now();
    const { group } = await groupService.createGroup(groupName, 'Testing settlements', creator.id);
    console.log(`Created group: ${group.name} (${group.id})`);

    // 3. Add members
    await groupService.addMember(group.id, TEST_MEMBER1, creator.id);
    await groupService.addMember(group.id, TEST_MEMBER2, creator.id);
    console.log('Added members to the test group.');

    // 4. Test createSettlement (Success Case: Member 1 pays Creator 20.00 USD)
    console.log('\nTesting createSettlement() success case...');
    const payload1 = {
      payerId: member1.id,
      payeeId: creator.id,
      amount: 20.00,
      currency: 'USD',
      date: new Date()
    };
    const settlement1 = await settlementService.createSettlement(group.id, payload1, creator.id);
    console.log('Recorded Settlement 1:', settlement1.id);
    assert.strictEqual(settlement1.payerId, member1.id);
    assert.strictEqual(settlement1.payeeId, creator.id);
    assert.strictEqual(parseFloat(settlement1.amount), 20.00);
    console.log('✔ Settlement recorded successfully.');

    // 5. Test createSettlement failure: self-settlement block
    console.log('\nTesting self-settlement validation block...');
    const payloadSelf = {
      payerId: creator.id,
      payeeId: creator.id, // Same user
      amount: 10.00,
      currency: 'USD'
    };
    try {
      await settlementService.createSettlement(group.id, payloadSelf, creator.id);
      throw new Error('Self-settlement calculation should have failed.');
    } catch (err) {
      console.log('✔ Successfully rejected self-settlement:', err.message);
      assert.ok(err.message.includes('cannot be the same user'));
    }

    // 6. Test createSettlement failure: non-member block
    console.log('\nTesting non-member settlement validation block...');
    const payloadNonMember = {
      payerId: member1.id,
      payeeId: nonMember.id, // Not in group
      amount: 15.00,
      currency: 'USD'
    };
    try {
      await settlementService.createSettlement(group.id, payloadNonMember, creator.id);
      throw new Error('Non-member settlement should have failed.');
    } catch (err) {
      console.log('✔ Successfully rejected non-member settlement:', err.message);
      assert.ok(err.message.includes('must be an active member'));
    }

    // 7. Test getGroupSettlements
    console.log('\nTesting getGroupSettlements()...');
    const settlementsList = await settlementService.getGroupSettlements(group.id, creator.id);
    console.log(`Fetched ${settlementsList.length} settlements for group.`);
    assert.strictEqual(settlementsList.length, 1);
    console.log('✔ Settlements list retrieved successfully.');

    // 8. Test getSettlementDetails
    console.log('\nTesting getSettlementDetails()...');
    const details = await settlementService.getSettlementDetails(settlement1.id, creator.id);
    console.log(`Settlement details retrieved for ID: ${details.id}`);
    assert.strictEqual(details.payer.name, 'Settle Member 1');
    assert.strictEqual(details.payee.name, 'Settle Creator');
    console.log('✔ Settlement details verified.');

    console.log('\n--- All Settlement Module tests passed successfully! 🎉 ---');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
