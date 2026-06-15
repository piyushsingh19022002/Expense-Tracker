import prisma from '../config/prisma.js';
import { normalizeMemberIdentifier, findMatchingUser } from '../utils/memberMatcher.js';
import { buildLookupContext } from '../services/memberLookupService.js';
import assert from 'assert';

async function main() {
  console.log('--- Starting Comprehensive Member Matcher Verification Tests ---');

  // Test 1: Normalization & Unicode check
  console.log('1. Testing normalizeMemberIdentifier (Unicode and space collapse)...');
  assert.strictEqual(normalizeMemberIdentifier('  Aishâ  '), 'aisha'); // Accents removed, trimmed
  assert.strictEqual(normalizeMemberIdentifier('aishä'), 'aisha');
  assert.strictEqual(normalizeMemberIdentifier('AISHA'), 'aisha');
  assert.strictEqual(normalizeMemberIdentifier('Rohan   '), 'rohan');
  assert.strictEqual(normalizeMemberIdentifier('Aisha   Dev'), 'aisha dev');
  assert.strictEqual(normalizeMemberIdentifier('  Aisha   Singh  '), 'aisha singh');
  console.log('✔ Normalization tests passed.');

  // Test 2: Database and membership simulation
  console.log('2. Setting up temporary DB matching records...');
  
  const creatorEmail = 'matcher.creator@example.com';
  const memberEmail = 'matcher.member@example.com';
  
  // Clean up previous runs
  await prisma.membership.deleteMany({
    where: {
      user: {
        email: { in: [creatorEmail, memberEmail] }
      }
    }
  });
  await prisma.user.deleteMany({
    where: {
      email: { in: [creatorEmail, memberEmail] }
    }
  });

  // User 1 is Aisha (ACTIVE member)
  const user1 = await prisma.user.create({
    data: {
      email: 'Matcher.Creator@example.com', // Casing differences
      name: '  Aishâ  ', // Accents and Spaces in name
      password: 'testPassword123'
    }
  });

  // User 2 is Rohan (former member who left on 2026-06-10)
  const user2 = await prisma.user.create({
    data: {
      email: memberEmail,
      name: 'Rohan Goel',
      password: 'testPassword123'
    }
  });

  const group = await prisma.group.create({
    data: {
      name: 'Matcher Test Group',
      description: 'Testing matching capabilities'
    }
  });

  // Add memberships
  // User 1 is ACTIVE
  await prisma.membership.create({
    data: {
      groupId: group.id,
      userId: user1.id,
      status: 'ACTIVE'
    }
  });

  // User 2 is LEFT (former member) with leftAt set to 2026-06-10
  await prisma.membership.create({
    data: {
      groupId: group.id,
      userId: user2.id,
      status: 'LEFT',
      leftAt: new Date('2026-06-10')
    }
  });

  console.log('3. Testing Lookup Context resolutions and Timelines...');
  const mockCsvRows = [
    {
      rowNumber: 2,
      data: {
        'Paid By': ' Aishâ ',
        'Split Between': 'matcher.member@example.com'
      }
    }
  ];

  const lookupContext = await buildLookupContext(group.id, mockCsvRows);

  // Test active member resolution
  const resolvedAisha = lookupContext.resolveMember(' Aishâ ', new Date('2026-06-15'));
  assert.ok(resolvedAisha);
  assert.strictEqual(resolvedAisha.anomalyType, null); // Valid active member
  assert.strictEqual(resolvedAisha.matchedUser.id, user1.id);

  // Test former member timeline rules:
  // Transaction on 2026-06-05 (before Rohan left on 2026-06-10) -> Should be valid!
  const resolvedRohanBefore = lookupContext.resolveMember('Rohan Goel', new Date('2026-06-05'));
  assert.strictEqual(resolvedRohanBefore.anomalyType, null); // Still active at transaction time!
  assert.strictEqual(resolvedRohanBefore.matchedUser.id, user2.id);

  // Transaction on 2026-06-15 (after Rohan left on 2026-06-10) -> Should trigger FORMER_MEMBER!
  const resolvedRohanAfter = lookupContext.resolveMember('Rohan Goel', new Date('2026-06-15'));
  assert.strictEqual(resolvedRohanAfter.anomalyType, 'FORMER_MEMBER'); // Left before transaction date
  assert.strictEqual(resolvedRohanAfter.matchedUser.id, user2.id);

  // Test system user not in group (Priya)
  const stranger = await prisma.user.create({
    data: {
      email: 'stranger@example.com',
      name: 'Priya',
      password: 'testPassword123'
    }
  });

  const mockRowsWithStranger = [{ data: { 'paid_by': 'Priya' } }];
  const contextWithStranger = await buildLookupContext(group.id, mockRowsWithStranger);
  
  const resolvedStranger = contextWithStranger.resolveMember('Priya', new Date());
  assert.strictEqual(resolvedStranger.anomalyType, 'UNKNOWN_MEMBER');
  assert.strictEqual(resolvedStranger.matchedUser.id, stranger.id);
  assert.strictEqual(resolvedStranger.matchedMembership, null);

  console.log('✔ All matching and timeline tests passed.');

  // Clean up
  console.log('4. Cleaning up test database records...');
  await prisma.membership.deleteMany({
    where: { groupId: group.id }
  });
  await prisma.group.delete({
    where: { id: group.id }
  });
  await prisma.user.deleteMany({
    where: {
      id: { in: [user1.id, user2.id, stranger.id] }
    }
  });

  console.log('--- All Member Matcher Tests PASSED! 🎉 ---');
}

main()
  .catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
