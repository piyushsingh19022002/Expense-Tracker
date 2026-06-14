import React from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp } from 'lucide-react';

/**
 * @description Dashboard view representing financial aggregates.
 */
const Dashboard = () => {
  const statistics = [
    {
      title: 'Current Balance',
      value: '$12,450.00',
      indicator: '+12.5% this month',
      isPositive: true,
      icon: DollarSign,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Monthly Income',
      value: '$7,200.00',
      indicator: '+8.2% vs last month',
      isPositive: true,
      icon: ArrowUpRight,
      color: 'text-brand-success bg-brand-success/10 border-brand-success/20'
    },
    {
      title: 'Monthly Expenses',
      value: '$3,840.00',
      indicator: '+4.1% vs last month',
      isPositive: false,
      icon: ArrowDownRight,
      color: 'text-brand-danger bg-brand-danger/10 border-brand-danger/20'
    },
    {
      title: 'Savings Ratio',
      value: '46.6%',
      indicator: '+2.4% points up',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    }
  ];

  const transactions = [
    { id: 1, name: 'AWS Cloud Hosting', category: 'Infrastructure', amount: '-$120.00', date: 'Jun 14, 2026', isIncome: false },
    { id: 2, name: 'Freelance Design Retainer', category: 'Income', amount: '+$3,200.00', date: 'Jun 12, 2026', isIncome: true },
    { id: 3, name: 'WeWork Office Space', category: 'Office Rent', amount: '-$1,200.00', date: 'Jun 10, 2026', isIncome: false },
    { id: 4, name: 'Figma Team Plan', category: 'Software', amount: '-$45.00', date: 'Jun 08, 2026', isIncome: false },
    { id: 5, name: 'Uber Business Travel', category: 'Travel', amount: '-$32.50', date: 'Jun 05, 2026', isIncome: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Financial Overview</h2>
        <p className="text-xs text-brand-text-secondary">Summary stats and transactional audit metrics for your account.</p>
      </div>

      {/* Aggregate Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="flex flex-col gap-3.5 border-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">{stat.title}</span>
                <div className={`rounded-lg border p-1.5 ${stat.color}`}>
                  <Icon size={16} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-semibold tracking-tight text-white">{stat.value}</span>
                <span className={`text-[10px] font-semibold ${stat.isPositive ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {stat.indicator}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Analytics Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ledger Panel */}
        <Card className="lg:col-span-2 flex flex-col gap-4 border-slate-800/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            <Button variant="outline" className="px-3 py-1.5 text-xs font-semibold">View Statement</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
                  <th className="pb-3 font-semibold">Transaction Details</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-brand-text-primary">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 font-medium">{tx.name}</td>
                    <td className="py-3.5 text-brand-text-secondary">
                      <span className="rounded bg-slate-800/60 border border-slate-700/30 px-2 py-0.5 font-medium">{tx.category}</span>
                    </td>
                    <td className="py-3.5 text-brand-text-secondary">{tx.date}</td>
                    <td className={`py-3.5 text-right font-bold ${tx.isIncome ? 'text-brand-success' : 'text-brand-text-primary'}`}>
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Categories Progress */}
        <Card className="flex flex-col gap-4 border-slate-800/40">
          <h3 className="text-sm font-bold text-white">Budget Allocations</h3>
          <p className="text-xs text-brand-text-secondary">Distribution of expenses across key operational divisions.</p>
          
          <div className="flex-1 flex flex-col justify-center gap-4 py-2">
            <div className="space-y-4">
              {[
                { name: 'Office Rent & Facilities', percent: 45, color: 'bg-blue-500' },
                { name: 'Infrastructure & Tools', percent: 25, color: 'bg-brand-success' },
                { name: 'Salaries & Consultants', percent: 20, color: 'bg-amber-500' },
                { name: 'Travel & Entertainments', percent: 10, color: 'bg-brand-danger' }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-brand-text-primary">{item.name}</span>
                    <span className="text-brand-text-secondary">{item.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
