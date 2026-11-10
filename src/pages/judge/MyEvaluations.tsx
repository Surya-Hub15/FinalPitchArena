import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { History, Scale, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export const MyEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/judge/history');
        if (res.success && Array.isArray(res.data)) {
          setEvaluations(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" />
          <span>Evaluation History & Scorecards</span>
        </h1>
        <p className="text-xs text-slate-400">
          Historical record of your submitted venture assessments and weighted scoring decisions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading evaluations history...</div>
      ) : evaluations.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f172a] border border-slate-800 text-center text-xs text-slate-500">
          You haven't submitted any evaluations yet.
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Startup Venture</th>
                <th className="py-3 px-4">Challenge</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-center">Final Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {evaluations.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-4">
                    <span className="font-bold text-white text-sm block">{ev.startup_name}</span>
                    <span className="text-[11px] text-slate-400">{ev.industry}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-200">{ev.challenge_title}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ev.recommendation === 'SHORTLIST'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : ev.recommendation === 'NEEDS_REVISION'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {ev.recommendation}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-sm text-cyan-400 tabular-nums">
                    {ev.weighted_score}/100
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-[11px] font-mono text-emerald-400">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/judge/evaluate/${ev.application_id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <span>View Scorecard</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
