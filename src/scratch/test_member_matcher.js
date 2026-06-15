import prisma from '../config/prisma.js';
import { normalizeMemberIdentifier, findMatchingUser } from '../utils/memberMatcher.js';
import { buildLookupContext } from '../services/memberLookupService.js';
import assert from 'assert';

async function main() {
  console.log('--- Starting Member Matcher Verification Tests ---');

  // Test 1: Normalization
  console.log('1. Testing normalizeMemberIdentifier...');
  assert.strictEqual(normalizeMemberIdentifier('  Aisha  '), 'aisha');
  assert.strictEqual(normalizeMemberIdentifier('aisha'), 'aisha');
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

  // Create users with trailing spaces or casing differences in database to match the problem statement
  const user1 = await prisma.user.create({
    data: {
      email: 'Matcher.Creator@example.com', // Casing differences
      name: '  Aisha  ', // Spaces in name
      password: 'testPassword123'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: memberEmail,
      name: 'Rohan Goel', // Normal name
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

  // User 2 is LEFT (former member)
  await prisma.membership.create({
    data: {
      groupId: group.id,
      userId: user2.id,
      status: 'LEFT'
    }
  });

  console.log('3. Running lookup contexts...');
  const mockCsvRows = [
    {
      rowNumber: 2,
      data: {
        'Paid By': ' Aisha ', // Should match user1 (Aisha)
        'Split Between': 'matcher.member@example.com; matcher.creator@example.com'
      }
    },
    {
      rowNumber: 3,
      data: {
        'Paid By': 'Rohan Goel', // Should match user2 (former)
        'Split Between': 'aisha'
      }
    }
  ];

  const lookupContext = await buildLookupContext(group.id, mockCsvRows);

  // Assertions on resolveUser
  // Test Payer 1 (Aisha)
  const resolvedAisha = lookupContext.resolveUser(' Aisha ');
  assert.ok(resolvedAisha, 'Should resolve Aisha');
  assert.strictEqual(resolvedAisha.user.id, user1.id);
  assert.strictEqual(resolvedAisha.isMember, true);
  assert.strictEqual(resolvedAisha.membershipStatus, 'ACTIVE');

  // Test case differences and spaces
  const resolvedAishaCase = lookupContext.resolveUser('aisha');
  assert.ok(resolvedAishaCase, 'Should resolve lowercased aisha');
  assert.strictEqual(resolvedAishaCase.user.id, user1.id);

  // Test email match
  const resolvedEmail = lookupContext.resolveUser('matcher.creator@example.com');
  assert.ok(resolvedEmail, 'Should resolve by email');
  assert.strictEqual(resolvedEmail.user.id, user1.id);

  // Test Rohan (former member)
  const resolvedRohan = lookupContext.resolveUser('Rohan Goel ');
  assert.ok(resolvedRohan, 'Should resolve Rohan Goel');
  assert.strictEqual(resolvedRohan.user.id, user2.id);
  assert.strictEqual(resolvedRohan.isMember, true);
  assert.strictEqual(resolvedRohan.membershipStatus, 'LEFT');

  // Test non-member resolution
  const stranger = await prisma.user.create({
    data: {
      email: 'stranger@example.com',
      name: 'Priya',
      password: 'testPassword123'
    }
  });

  const mockRowsWithStranger = [
    {
      rowNumber: 2,
      data: {
        'Paid By': 'Priya', // Exists system-wide, not in group
        'Split Between': 'Aisha'
      }
    }
  ];

  const contextWithStranger = await buildLookupContext(group.id, mockRowsWithStranger);
  const resolvedStranger = contextWithStranger.resolveUser('Priya');
  assert.ok(resolvedStranger, 'Should match Priya as system-wide user');
  assert.strictEqual(resolvedStranger.user.id, stranger.id);
  assert.strictEqual(resolvedStranger.isMember, false);
  assert.strictEqual(resolvedStranger.membershipStatus, null);

  console.log('✔ Lookup contexts resolved matches perfectly.');

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
