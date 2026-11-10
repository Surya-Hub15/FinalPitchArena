import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { FileText, ArrowRight, Calendar, Compass } from 'lucide-react';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/api/student/applications');
        if (res.success && Array.isArray(res.data)) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Error fetching student applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Challenge Applications</h1>
          <p className="text-xs text-slate-400">Track real-time evaluation status, released reviewer feedback, and scheduled pitches.</p>
        </div>
        <Link
          to="/student/challenges"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
        >
          Apply to New Challenge
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Applications</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            You haven't submitted your startups to any competitions yet. Browse active challenges and apply with one click.
          </p>
          <Link
            to="/student/challenges"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Active Challenges</span>
          </Link>
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
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 text-center">Round</th>
                  <th className="py-3.5 px-4 text-center">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono text-indigo-400 font-semibold">
                      #{app.id}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-sm block">{app.startup_name}</span>
                      <span className="text-[11px] text-slate-400">{app.industry}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-200 font-medium">{app.challenge_title}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-medium">
                      Round {app.current_round}
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
                        to={`/student/applications/${app.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>Cockpit</span>
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
