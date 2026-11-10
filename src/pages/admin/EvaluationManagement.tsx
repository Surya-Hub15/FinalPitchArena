import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Scale,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const EvaluationManagement: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEvaluations = async () => {
    try {
      const res = await api.get('/api/admin/evaluations');
      if (res.success && Array.isArray(res.data)) {
        setEvaluations(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleUnlock = async (evalId: number) => {
    setUnlockingId(evalId);
    setMsg(null);
    try {
      const res = await api.post(`/api/admin/evaluations/${evalId}/unlock`);
      if (res.success) {
        setMsg({ type: 'success', text: 'Evaluation successfully unlocked for judge edits.' });
        fetchEvaluations();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to unlock evaluation.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error unlocking evaluation.' });
    } finally {
      setUnlockingId(null);
    }
  };

  // Group by application_id to detect variance > 25 points
  const appEvalsMap: { [key: number]: any[] } = {};
  evaluations.forEach(ev => {
    if (!appEvalsMap[ev.application_id]) appEvalsMap[ev.application_id] = [];
    appEvalsMap[ev.application_id].push(ev);
  });

  const varianceAppIds = new Set<number>();
  Object.entries(appEvalsMap).forEach(([appId, evList]) => {
    if (evList.length > 1) {
      const scores = evList.map(e => e.weighted_score || 0);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      if (max - min >= 25) {
        varianceAppIds.add(parseInt(appId, 10));
      }
    }
  });

  const filtered = evaluations.filter(e =>
    (e.startup_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.judge_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.challenge_title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scoreboard & Variance Surveillance</h1>
          <p className="text-xs text-slate-400">
            Real-time aggregate score tracking, judge discrepancy alerts (Δ ≥ 25 pts), and evaluation lock controls.
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

      {/* Variance Alert Banner */}
      {varianceAppIds.size > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <span className="font-bold block">Statistical Discrepancy Detected in {varianceAppIds.size} Application(s)</span>
            <span>
              Reviewers have a score divergence exceeding 25 points. Review individual rubric criteria breakdown or unlock evaluations for jury deliberation.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter evaluations by startup, judge, or challenge..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading evaluation scorecards...</div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Startup Venture</th>
                <th className="py-3 px-4">Judge Reviewer</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Criteria Breakdown</th>
                <th className="py-3 px-4 text-center">Lock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(ev => {
                const hasVariance = varianceAppIds.has(ev.application_id);
                return (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block">{ev.startup_name}</span>
                        {hasVariance && (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/40">
                            Variance Alert
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{ev.challenge_title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">App #{ev.application_id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-200 block">{ev.judge_name}</span>
                      <span className="text-[11px] text-slate-400 block">{ev.judge_org}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-bold font-mono tabular-nums text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        {ev.weighted_score}/100
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                        ev.recommendation === 'STRONG_YES' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        ev.recommendation === 'YES' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                        ev.recommendation === 'MAYBE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {ev.recommendation?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      <span>Inn: <strong className="text-slate-200 font-mono">{ev.innovation_score}</strong></span> ·{' '}
                      <span>Mkt: <strong className="text-slate-200 font-mono">{ev.market_score}</strong></span> ·{' '}
                      <span>Feas: <strong className="text-slate-200 font-mono">{ev.feasibility_score}</strong></span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {ev.is_locked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
                          <Unlock className="w-3 h-3" /> Open
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {ev.is_locked && (
                        <button
                          onClick={() => handleUnlock(ev.id)}
                          disabled={unlockingId === ev.id}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition disabled:opacity-50"
                        >
                          {unlockingId === ev.id ? 'Unlocking...' : 'Unlock Evaluation'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
