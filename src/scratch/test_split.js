import { calculateEqualSplit, calculateExactSplit, calculatePercentageSplit } from '../services/splitService.js';
import assert from 'assert';

function testEqualSplit() {
  console.log('Testing Equal Split...');
  
  // 1. Clean division
  const res1 = calculateEqualSplit(90.00, ['userA', 'userB', 'userC']);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.shares.length, 3);
  assert.strictEqual(res1.shares[0].share, 30.00);
  assert.strictEqual(res1.shares[1].share, 30.00);
  assert.strictEqual(res1.shares[2].share, 30.00);

  // 2. Rounding cent distribution (100.00 divided by 3)
  const res2 = calculateEqualSplit(100.00, ['userA', 'userB', 'userC']);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.shares[0].share, 33.34); // First gets remainder cent
  assert.strictEqual(res2.shares[1].share, 33.33);
  assert.strictEqual(res2.shares[2].share, 33.33);
  const sum2 = res2.shares.reduce((sum, p) => sum + p.share, 0);
  assert.strictEqual(sum2, 100.00);

  // 3. Rounding cent distribution (100.00 divided by 6)
  const res3 = calculateEqualSplit(100.00, ['u1', 'u2', 'u3', 'u4', 'u5', 'u6']);
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.shares[0].share, 16.67);
  assert.strictEqual(res3.shares[1].share, 16.67);
  assert.strictEqual(res3.shares[2].share, 16.67);
  assert.strictEqual(res3.shares[3].share, 16.67);
  assert.strictEqual(res3.shares[4].share, 16.66);
  assert.strictEqual(res3.shares[5].share, 16.66);
  const sum3 = res3.shares.reduce((sum, p) => sum + p.share, 0);
  assert.strictEqual(sum3, 100.00);

  console.log('✔ Equal Split Tests Passed!');
}

function testExactSplit() {
  console.log('Testing Exact Split...');

  // 1. Success case
  const res1 = calculateExactSplit(50.00, [
    { userId: 'u1', share: 20.00 },
    { userId: 'u2', share: 30.00 }
  ]);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.shares[0].share, 20.00);
  assert.strictEqual(res1.shares[1].share, 30.00);

  // 2. Failure case: Sum mismatch
  const res2 = calculateExactSplit(50.00, [
    { userId: 'u1', share: 20.00 },
    { userId: 'u2', share: 29.99 }
  ]);
  assert.strictEqual(res2.success, false);
  assert.ok(res2.errors[0].includes('must equal the total expense amount'));

  console.log('✔ Exact Split Tests Passed!');
}

function testPercentageSplit() {
  console.log('Testing Percentage Split...');

  // 1. Success case (no rounding delta)
  const res1 = calculatePercentageSplit(100.00, [
    { userId: 'u1', percentage: 40 },
    { userId: 'u2', percentage: 60 }
  ]);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.shares[0].share, 40.00);
  assert.strictEqual(res1.shares[1].share, 60.00);

  // 2. Success case (rounding adjustment required: 10.00 with 33.33%, 33.33%, 33.34%)
  const res2 = calculatePercentageSplit(10.00, [
    { userId: 'u1', percentage: 33.33 },
    { userId: 'u2', percentage: 33.33 },
    { userId: 'u3', percentage: 33.34 }
  ]);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.shares[0].share, 3.33);
  assert.strictEqual(res2.shares[1].share, 3.33);
  assert.strictEqual(res2.shares[2].share, 3.34); // Highest fractional diff gets adjusted
  const sum2 = res2.shares.reduce((sum, p) => sum + p.share, 0);
  assert.strictEqual(sum2, 10.00);

  // 3. Failure case: Percentages do not sum to 100%
  const res3 = calculatePercentageSplit(100.00, [
    { userId: 'u1', percentage: 50 },
    { userId: 'u2', percentage: 49.9 }
  ]);
  assert.strictEqual(res3.success, false);
  assert.ok(res3.errors[0].includes('must sum to exactly 100%'));

  console.log('✔ Percentage Split Tests Passed!');
}

function testValidation() {
  console.log('Testing Validation Edge Cases...');

  // 1. Amount negative or zero
  const res1 = calculateEqualSplit(0, ['u1']);
  assert.strictEqual(res1.success, false);
  assert.ok(res1.errors[0].includes('positive number'));

  // 2. Empty participants list
  const res2 = calculateEqualSplit(50.00, []);
  assert.strictEqual(res2.success, false);
  assert.ok(res2.errors[0].includes('cannot be empty'));

  // 3. Missing userId
  const res3 = calculateEqualSplit(50.00, [{ someOtherField: 'hello' }]);
  assert.strictEqual(res3.success, false);
  assert.ok(res3.errors[0].includes('valid userId'));

  // 4. Invalid share in exact split
  const res4 = calculateExactSplit(50.00, [
    { userId: 'u1', share: -5.00 },
    { userId: 'u2', share: 55.00 }
  ]);
  assert.strictEqual(res4.success, false);
  assert.ok(res4.errors[0].includes('non-negative numerical share'));

  console.log('✔ Validation Edge Case Tests Passed!');
}

try {
  testEqualSplit();
  testExactSplit();
  testPercentageSplit();
  testValidation();
  console.log('\n========================================');
  console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('========================================');
} catch (err) {
  console.error('Test validation failed:', err);
  process.exit(1);
}
