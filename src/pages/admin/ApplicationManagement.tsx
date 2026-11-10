import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { FileCheck, Search, Scale, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const ApplicationManagement: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/api/admin/applications');
        if (res.success && Array.isArray(res.data)) {
          setApplications(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const statuses = [
    'ALL', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION',
    'SHORTLISTED', 'PITCH_SCHEDULED', 'PILOT', 'SELECTED', 'REJECTED'
  ];

  const filtered = applications.filter(a => {
    const matchesSearch = (a.startup_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (a.challenge_title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (a.applicant_email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Central Applications Pipeline</h1>
          <p className="text-xs text-slate-400">Master pipeline oversight, judge assignment tracking, and round progression decisions.</p>
        </div>
        <Link
          to="/admin/assignments"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-emerald-600/30"
        >
          <Scale className="w-4 h-4" />
          <span>Assign Judges Engine</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by startup, challenge, or applicant email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 rounded-lg">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Pipelines' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading applications pipeline...</div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">App ID</th>
                  <th className="py-3.5 px-4">Startup Venture</th>
                  <th className="py-3.5 px-4">Challenge</th>
                  <th className="py-3.5 px-4 text-center">Judges Assigned</th>
                  <th className="py-3.5 px-4 text-center">Reviews Completed</th>
                  <th className="py-3.5 px-4 text-center">Average Score</th>
                  <th className="py-3.5 px-4 text-center">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono text-rose-400 font-semibold">
                      #{app.id}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-sm block">{app.startup_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{app.applicant_email}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-200">{app.challenge_title}</td>
                    <td className="py-4 px-4 text-center font-mono font-medium">
                      {app.assigned_judges_count}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-medium text-emerald-400">
                      {app.completed_reviews_count} / {app.assigned_judges_count}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-cyan-400">
                      {app.average_score ? `${app.average_score}/100` : '—'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'PILOT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'NEEDS_REVISION'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>Audit Cockpit</span>
                        <ArrowRight className="w-3 h-3" />
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
