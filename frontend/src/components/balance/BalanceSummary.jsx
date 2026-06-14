import React, { useMemo } from 'react';
import BalanceCard from './BalanceCard.jsx';

/**
 * @description Renders the three top-level summary cards:
 * Total Receivable, Total Payable, Net Position.
 *
 * @param {Array}  balances - Array of balance objects from API
 * @param {string} userId   - Current user's ID to compute personal metrics
 */
const BalanceSummary = ({ balances = [], userId }) => {
  const { totalReceivable, totalPayable, netPosition } = useMemo(() => {
    let receivable = 0;
    let payable = 0;

    balances.forEach((b) => {
      if (b.netBalance > 0) receivable += b.netBalance;
      else if (b.netBalance < 0) payable += Math.abs(b.netBalance);
    });

    // If userId provided, show personal metrics; else group-wide totals
    if (userId) {
      const mine = balances.find((b) => b.userId === userId);
      if (mine) {
        return {
          totalReceivable: mine.netBalance > 0 ? mine.netBalance : 0,
          totalPayable: mine.netBalance < 0 ? Math.abs(mine.netBalance) : 0,
          netPosition: mine.netBalance
        };
      }
    }

    return {
      totalReceivable: receivable,
      totalPayable: payable,
      netPosition: receivable - payable
    };
  }, [balances, userId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BalanceCard
        label="Total Receivable"
        amount={totalReceivable}
        variant="positive"
      />
      <BalanceCard
        label="Total Payable"
        amount={totalPayable}
        variant="negative"
      />
      <BalanceCard
        label="Net Position"
        amount={netPosition}
        variant={netPosition >= 0 ? 'positive' : 'negative'}
      />
    </div>
  );
};

export default BalanceSummary;
