import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';

export const JudgeAssignments: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<number[]>([]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const [appRes, judgeRes] = await Promise.all([
        api.get('/api/admin/applications'),
        api.get('/api/admin/judges')
      ]);
      if (appRes.success && Array.isArray(appRes.data)) {
        setApplications(appRes.data);
      }
      if (judgeRes.success && Array.isArray(judgeRes.data)) {
        setJudges(judgeRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || selectedJudgeIds.length === 0) {
      setMsg({ type: 'error', text: 'Select an application and at least one judge reviewer.' });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await api.post('/api/admin/assignments', {
        application_id: selectedAppId,
        judge_ids: selectedJudgeIds,
        deadline
      });
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Judges assigned successfully.' });
        setSelectedAppId(null);
        setSelectedJudgeIds([]);
        loadData();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to assign judges.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error executing assignments.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = applications.filter(a =>
    (a.startup_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.challenge_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white">Judge Reviewer Assignment Matrix</h1>
        <p className="text-xs text-slate-400">
          Match applications to domain expert reviewers, specify evaluation windows, and balance jury workloads.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading assignment pipeline...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Applications Queue ({applications.length})
              </h2>
              <input
                type="text"
                placeholder="Search ventures..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 bg-[#0f172a] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-3">
              {filteredApps.map(app => {
                const isSelected = selectedAppId === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-rose-600/10 border-rose-500 text-white shadow-lg shadow-rose-900/10'
                        : 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          #{app.id}
                        </span>
                        <h3 className="text-sm font-bold text-white">{app.startup_name}</h3>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-xs text-slate-400">{app.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                          app.status === 'SHORTLISTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          app.status === 'UNDER_REVIEW' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                      <span>Challenge: <strong className="text-slate-300 font-normal">{app.challenge_title}</strong></span>
                      <span>·</span>
                      <span>Assigned Judges: <strong className="text-rose-400 font-bold tabular-nums">{app.assigned_judges_count}</strong></span>
                      <span>·</span>
                      <span>Reviews Completed: <strong className="text-emerald-400 font-bold tabular-nums">{app.completed_reviews_count}</strong></span>
                      {app.average_score && (
                        <>
                          <span>·</span>
                          <span>Avg Score: <strong className="text-amber-300 font-mono tabular-nums">{app.average_score}/100</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment Control Box */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-5 sticky top-20">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-rose-500" />
                  Assign Reviewers
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedAppId
                    ? `Assigning judges to Application #${selectedAppId}`
                    : 'Select an application from the queue to assign reviewers.'}
                </p>
              </div>

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                    Evaluation Deadline
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase">
                    Select Judges ({selectedJudgeIds.length} chosen)
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {judges.map(judge => {
                      const isSelected = selectedJudgeIds.includes(judge.id);
                      return (
                        <div
                          key={judge.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedJudgeIds(selectedJudgeIds.filter(id => id !== judge.id));
                            } else {
                              setSelectedJudgeIds([...selectedJudgeIds, judge.id]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-rose-600/10 border-rose-500 text-white'
                              : 'bg-[#0c1222] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <span className="font-semibold block">{judge.profile?.full_name || judge.email}</span>
                            <span className="text-[10px] text-slate-400 block">{judge.profile?.organization}</span>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-700'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedAppId || selectedJudgeIds.length === 0}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Executing Assignments...' : 'Commit Judge Assignment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
