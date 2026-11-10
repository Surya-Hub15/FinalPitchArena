import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Coins,
  Award,
  Sparkles,
  Trophy,
  Target,
  ShieldCheck,
  Crown,
  ArrowUpRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const Rewards: React.FC = () => {
  const [rewardsData, setRewardsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await api.get('/api/student/rewards');
        if (res.success && res.data) {
          setRewardsData(res.data);
        }
      } catch (err) {
        console.error('Failed fetching rewards', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading achievements and coin wallet...</div>;
  }

  const balance = rewardsData?.balance || 50;
  const transactions = rewardsData?.transactions || [];
  const achievements = rewardsData?.achievements || [];

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Wallet Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0f172a] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">GAMIFIED VENTURE WALLET</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Validated Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Achievements & Coins</h1>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Earn venture coins and digital milestone badges by registering startups, submitting challenge applications, and securing official judge shortlists.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center min-w-[160px]">
          <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Current Balance</span>
          <div className="flex items-center justify-center gap-2 text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
            <Coins className="w-7 h-7 text-amber-400" />
            <span>{balance}</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono mt-1 block">Venture Coins</span>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Digital Milestone Badges</h2>
          <span className="text-xs text-slate-400 font-mono">
            {achievements.filter((a: any) => a.is_unlocked).length} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach: any) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                ach.is_unlocked
                  ? 'bg-[#0f172a] border-amber-500/40'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    ach.is_unlocked
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {ach.is_unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                    +{ach.coins_reward} Coins
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 text-[11px] font-mono">
                {ach.is_unlocked ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked on {new Date(ach.unlocked_at).toLocaleDateString()}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Locked · Complete milestone</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Coin Transaction Ledger</h2>

        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction Reason</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-sans font-medium text-white">{tx.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                    +{tx.amount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-200">
                    {tx.balance_after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
