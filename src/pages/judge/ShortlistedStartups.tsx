import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { CheckCircle2, Trophy, ArrowRight, Video } from 'lucide-react';

export const ShortlistedStartups: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShortlisted = async () => {
      try {
        const res = await api.get('/api/judge/shortlisted');
        if (res.success && Array.isArray(res.data)) {
          setStartups(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span>Shortlisted Contenders & Finalists</span>
        </h1>
        <p className="text-xs text-slate-400">
          Startups advancing to Round 2 and live Shark Tank presentations based on consensus committee reviews.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading shortlisted startups...</div>
      ) : startups.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f172a] border border-slate-800 text-center text-xs text-slate-500">
          No startups shortlisted yet in this cycle.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map(s => (
            <div key={s.application_id} className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-mono font-semibold uppercase">Round {s.current_round} Finalist</span>
                  {s.average_score && (
                    <span className="font-mono text-cyan-400 font-bold">{s.average_score}/100 Avg</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{s.startup_name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{s.tagline}</p>
                <div className="text-[11px] text-indigo-300 font-mono">
                  Challenge: {s.challenge_title}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Industry: {s.industry}</span>
                <Link
                  to="/judge/sessions"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Pitch Room</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
