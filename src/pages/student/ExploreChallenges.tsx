import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { Search, Compass, Calendar, ArrowRight, Rocket, CheckCircle2, AlertCircle } from 'lucide-react';

export const ExploreChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [selectedStartupId, setSelectedStartupId] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chRes, stRes] = await Promise.all([
          api.get('/api/public/challenges'),
          api.get('/api/student/startups')
        ]);
        if (chRes.success && Array.isArray(chRes.data)) {
          setChallenges(chRes.data);
        }
        if (stRes.success && Array.isArray(stRes.data)) {
          setStartups(stRes.data);
          if (stRes.data.length > 0) setSelectedStartupId(stRes.data[0].id.toString());
        }
      } catch (err) {
        console.error('Error loading challenges', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApply = async () => {
    if (!selectedChallenge || !selectedStartupId) return;
    setApplying(true);
    setApplyError('');

    try {
      const res = await api.post('/api/student/applications', {
        challenge_id: selectedChallenge.id,
        startup_id: selectedStartupId
      });

      if (res.success) {
        setApplySuccess(true);
      } else {
        setApplyError(res.error || 'Submission failed.');
      }
    } catch (err: any) {
      setApplyError(err.message || 'Error occurred.');
    } finally {
      setApplying(false);
    }
  };

  const filtered = challenges.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.organization.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Explore Innovation Challenges</h1>
          <p className="text-xs text-slate-400">Discover active venture challenges and apply with your registered startups.</p>
        </div>
        <Link
          to="/student/startups"
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
        >
          Manage My Startups
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by challenge title, industry, or organization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading challenges...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(ch => (
            <div
              key={ch.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-400 font-semibold">{ch.organization}</span>
                  <span className="font-mono text-[11px] text-slate-400">{ch.category}</span>
                </div>
                <h3 className="text-base font-bold text-white line-clamp-2">{ch.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{ch.problem_statement}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Prize Grant:</span>
                  <span className="text-emerald-400 font-semibold">{ch.prize_pool}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due: {ch.deadline}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setApplySuccess(false);
                      setApplyError('');
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1-Click Fast Apply Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f172a] border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Apply with Startup</h3>
            <p className="text-xs text-slate-300">
              Applying to: <strong className="text-indigo-400">{selectedChallenge.title}</strong>
            </p>

            {applySuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Application Submitted (+50 Coins)!</span>
                </div>
                <p>Your venture has been received and queued for administrative assignment.</p>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {startups.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-amber-400">You must register a startup profile before applying.</p>
                    <Link
                      to="/student/startups"
                      className="block text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Create Startup Profile First
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs text-slate-300 block font-medium">Select Startup Profile:</label>
                    <select
                      value={selectedStartupId}
                      onChange={(e) => setSelectedStartupId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      {startups.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.industry} · Stage: {s.stage})
                        </option>
                      ))}
                    </select>

                    {applyError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{applyError}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setSelectedChallenge(null)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>{applying ? 'Submitting...' : 'Confirm Submission'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
