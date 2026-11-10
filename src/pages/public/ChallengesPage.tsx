import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { Search, Compass, Calendar, Award, ArrowRight, Filter } from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get('/api/public/challenges');
        if (res.success && Array.isArray(res.data)) {
          setChallenges(res.data);
        }
      } catch (err) {
        console.error('Error fetching challenges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const categories = ['ALL', 'CleanTech & IoT', 'HealthTech & AI', 'Fintech & Web3'];

  const filtered = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.problem_statement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-6 lg:px-12 py-12 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">INNOVATION ARENA</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Active Innovation Challenges</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Browse active venture challenges sponsored by industry consortia and university accelerators. Submit your startup to win grants, incubation, and pilot deployment.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by challenge title, organization, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Buttons (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 rounded-lg">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading innovation challenges...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#0f172a] rounded-2xl border border-slate-800">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No challenges match your criteria</h3>
          <p className="text-xs text-slate-400">Try adjusting your keyword search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(challenge => (
            <div
              key={challenge.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-indigo-400 font-medium">{challenge.organization}</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {challenge.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {challenge.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {challenge.description || challenge.problem_statement}
                </p>

                {challenge.required_skills && Array.isArray(challenge.required_skills) && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    {challenge.required_skills.slice(0, 3).map((skill: string, idx: number) => (
                      <span key={idx} className="text-[10px] text-slate-400">
                        {skill}{idx < 2 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Prize Grant:</span>
                  <span className="text-emerald-400 font-semibold font-mono">{challenge.prize_pool}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due: {challenge.deadline}</span>
                  </div>

                  <Link
                    to={`/challenges/${challenge.id}`}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>View Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
