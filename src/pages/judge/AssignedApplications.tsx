import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Scale
} from 'lucide-react';

export const AssignedApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await api.get('/api/judge/applications');
        if (res.success && Array.isArray(res.data)) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Error fetching assigned applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const filtered = applications.filter(app => {
    const matchesSearch = (app.startup_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.challenge_title || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'PENDING') return matchesSearch && !app.is_evaluated;
    if (filter === 'COMPLETED') return matchesSearch && app.is_evaluated;
    if (filter === 'SHORTLISTED') return matchesSearch && app.recommendation === 'SHORTLIST';
    if (filter === 'REJECTED') return matchesSearch && app.recommendation === 'REJECT';
    return matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Assigned Venture Applications</h1>
          <p className="text-xs text-slate-400">Applications assigned to your review portfolio by the platform director.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search assigned startups or challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 rounded-lg">
          {['ALL', 'PENDING', 'COMPLETED', 'SHORTLISTED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'All Assigned' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading assigned applications...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#0f172a] rounded-2xl border border-slate-800">
          <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No assigned applications found</h3>
          <p className="text-xs text-slate-400">You are all caught up with your evaluation assignments.</p>
        </div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Startup Venture</th>
                  <th className="py-3.5 px-4">Challenge</th>
                  <th className="py-3.5 px-4">Review Deadline</th>
                  <th className="py-3.5 px-4 text-center">Review Status</th>
                  <th className="py-3.5 px-4 text-center">Score / Rec</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(app => (
                  <tr key={app.assignment_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono text-emerald-400 font-semibold">
                      #{app.application_id}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-sm block">{app.startup_name}</span>
                      <span className="text-[11px] text-slate-400">{app.industry} · Stage: {app.stage}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-200 font-medium">{app.challenge_title}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-amber-400 text-xs">
                      {app.assignment_deadline}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          app.is_evaluated
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {app.is_evaluated ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-mono">
                      {app.is_evaluated ? (
                        <div>
                          <span className="font-bold text-emerald-400 text-xs block">{app.weighted_score}/100</span>
                          <span className="text-[10px] text-slate-400 uppercase">{app.recommendation}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/judge/evaluate/${app.application_id}`}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                          app.is_evaluated
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{app.is_evaluated ? 'Review Scorecard' : 'Evaluate'}</span>
                      </Link>
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
