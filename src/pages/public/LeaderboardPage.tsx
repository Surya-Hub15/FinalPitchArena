import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Trophy, Rocket, Coins, Award, School } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'startups' | 'founders'>('startups');
  const [leaderboard, setLeaderboard] = useState<{ top_startups: any[]; top_founders: any[] }>({
    top_startups: [],
    top_founders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/api/public/leaderboard');
        if (res.success && res.data) {
          setLeaderboard(res.data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="px-6 lg:px-12 py-12 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400">ECOSYSTEM RANKINGS</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">PitchArena Leaderboard</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Discover the highest-rated collegiate ventures, top innovators, and competition contenders across partner universities.
        </p>
      </div>

      {/* Segmented Control Filter */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0f172a] rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('startups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'startups'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Top Rated Startups</span>
        </button>
        <button
          onClick={() => setActiveTab('founders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'founders'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Top Innovator Founders</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading leaderboard rankings...</div>
      ) : activeTab === 'startups' ? (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-14 text-center">Rank</th>
                  <th className="py-3.5 px-4">Startup Venture</th>
                  <th className="py-3.5 px-4">Industry / Domain</th>
                  <th className="py-3.5 px-4">Founder & College</th>
                  <th className="py-3.5 px-4 text-center">Shortlists</th>
                  <th className="py-3.5 px-4 text-right">Readiness Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {leaderboard.top_startups.map((startup, idx) => (
                  <tr key={startup.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 text-center font-mono font-bold">
                      {idx === 0 ? <span className="text-amber-400">#1</span> :
                       idx === 1 ? <span className="text-slate-300">#2</span> :
                       idx === 2 ? <span className="text-amber-600">#3</span> :
                       <span className="text-slate-500">#{idx + 1}</span>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-sm block">{startup.name}</span>
                        <span className="text-slate-400 line-clamp-1 text-[11px]">{startup.tagline}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[11px] text-slate-300">
                        {startup.industry}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-200 block">{startup.founder_name}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <School className="w-3 h-3 text-indigo-400" />
                          <span>{startup.college_name}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-emerald-400 font-semibold">
                      {startup.shortlisted_count}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-sm text-cyan-400 tabular-nums">
                      {startup.readiness_score}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-14 text-center">Rank</th>
                  <th className="py-3.5 px-4">Founder</th>
                  <th className="py-3.5 px-4">Institution & Major</th>
                  <th className="py-3.5 px-4 text-center">Startups Built</th>
                  <th className="py-3.5 px-4 text-center">Badges Earned</th>
                  <th className="py-3.5 px-4 text-right">Venture Coins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {leaderboard.top_founders.map((founder, idx) => (
                  <tr key={founder.user_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 text-center font-mono font-bold">
                      {idx === 0 ? <span className="text-amber-400">#1</span> :
                       idx === 1 ? <span className="text-slate-300">#2</span> :
                       idx === 2 ? <span className="text-amber-600">#3</span> :
                       <span className="text-slate-500">#{idx + 1}</span>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-indigo-300 text-xs shrink-0 overflow-hidden">
                          {founder.avatar_url ? (
                            <img src={founder.avatar_url} alt="Founder" className="w-full h-full object-cover" />
                          ) : (
                            founder.full_name[0]
                          )}
                        </div>
                        <span className="font-bold text-white text-sm">{founder.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-200 block">{founder.college_name || 'Innovation Campus'}</span>
                        <span className="text-[11px] text-slate-500">{founder.department || 'Applied Engineering'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-medium">
                      {founder.startups_count}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-indigo-400 font-semibold">
                      {founder.achievements_count}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-sm text-amber-400 tabular-nums">
                      {founder.coins_balance} Coins
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
