import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Coins,
  Gift,
  Award,
  Sparkles,
  Search,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const RewardsAdmin: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantStudentId, setGrantStudentId] = useState('');
  const [grantAmount, setGrantAmount] = useState(150);
  const [grantReason, setGrantReason] = useState('Director Merit Grant for outstanding prototype execution');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      if (res.success && Array.isArray(res.data)) {
        const studentList = res.data.filter((u: any) => u.role === 'STUDENT');
        setStudents(studentList);
        if (studentList.length > 0 && !grantStudentId) {
          setGrantStudentId(studentList[0].id.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAwardCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantStudentId || !grantAmount) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await api.post('/api/admin/rewards/award', {
        student_id: grantStudentId,
        amount: grantAmount,
        reason: grantReason
      });
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Innovation coins granted successfully.' });
        fetchUsers();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to grant coins.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error executing grant.' });
    } finally {
      setSubmitting(false);
    }
  };

  const earningRules = [
    { action: 'Complete Startup Registration', points: '+100 Coins', type: 'Onboarding' },
    { action: 'Submit Challenge Application', points: '+200 Coins', type: 'Participation' },
    { action: 'Shortlisted for Next Round', points: '+500 Coins', type: 'Milestone' },
    { action: 'Shark Tank Live Pitch Session Completed', points: '+750 Coins', type: 'Milestone' },
    { action: 'Winner / Finalist Selection', points: '+1,500 Coins', type: 'Grand Prize' },
    { action: 'Mentor Review Feedback Actioned', points: '+50 Coins', type: 'Engagement' }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Innovation Coins & Gamification Economy</h1>
          <p className="text-xs text-slate-400">
            Configure platform incentives, manage earn/burn tokenomics, and issue administrative merit grants.
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Direct Bonus Issuer */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Issue Manual Merit Grant
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Directly reward student founders for exceptional initiative, hackathon wins, or government pilot integration.
              </p>
            </div>

            <form onSubmit={handleAwardCoins} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Recipient Student Founder *</label>
                <select
                  value={grantStudentId}
                  onChange={(e) => setGrantStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.profile?.full_name || s.email} ({s.email}) — Balance: {s.profile?.coins || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Coins to Award *</label>
                <input
                  type="number"
                  min="25"
                  step="25"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(parseInt(e.target.value, 10) || 50)}
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Award Rationale *</label>
                <textarea
                  rows={3}
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="Reason for special coin allotment..."
                  className="w-full p-3 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !grantStudentId}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition disabled:opacity-50"
              >
                {submitting ? 'Dispensing Coins...' : 'Transfer Innovation Coins'}
              </button>
            </form>
          </div>

          <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Circulation Summary</span>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {students.reduce((acc, s) => acc + (s.profile?.coins || 0), 0).toLocaleString()} Coins
            </div>
            <p className="text-xs text-slate-400">Total active token balance across registered student innovation wallets.</p>
          </div>
        </div>

        {/* Right Column: Platform Coin Earning Engine Rules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Active Earning Rules & Milestone Allotments
              </h2>
            </div>

            <div className="space-y-2.5">
              {earningRules.map((r, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0c1222] border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{r.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{r.type}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {r.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Balance Registry */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Student Wallet Balances
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Student Founder</th>
                    <th className="py-2.5 px-3">Campus Affiliation</th>
                    <th className="py-2.5 px-3 text-right">Coin Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white block">{s.profile?.full_name || 'Student'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.email}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{s.profile?.college_name || 'Campus Member'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                        {s.profile?.coins || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
