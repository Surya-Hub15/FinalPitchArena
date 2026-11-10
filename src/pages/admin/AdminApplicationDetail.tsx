import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  FileCheck,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  Award,
  Video,
  FileText,
  UserPlus
} from 'lucide-react';

export const AdminApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Judge Assignment state
  const [allJudges, setAllJudges] = useState<any[]>([]);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/api/admin/applications/${id}`);
      if (res.success && res.data) {
        setApp(res.data);
        setStatus(res.data.status);
        setAdminNotes(res.data.admin_notes || '');
        setRevisionNotes(res.data.revision_notes || '');
      }
      const judgeRes = await api.get('/api/admin/judges');
      if (judgeRes.success && Array.isArray(judgeRes.data)) {
        setAllJudges(judgeRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMsg(null);
    try {
      const res = await api.patch(`/api/admin/applications/${id}/status`, {
        status,
        admin_notes: adminNotes,
        revision_notes: revisionNotes
      });
      if (res.success) {
        setMsg({ type: 'success', text: `Status successfully updated to ${status}.` });
        fetchDetail();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to update status.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error occurred.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignJudges = async () => {
    if (selectedJudgeIds.length === 0) return;
    setAssigning(true);
    try {
      const res = await api.post('/api/admin/assignments', {
        application_id: id,
        judge_ids: selectedJudgeIds
      });
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Judges assigned successfully.' });
        setSelectedJudgeIds([]);
        fetchDetail();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to assign judges.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error assigning judges.' });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500 text-sm">Loading application dossier...</div>;
  }

  if (!app) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Application Record Not Found</h2>
        <Link to="/admin/applications" className="text-xs text-rose-400 hover:underline">
          Return to Application Pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Pipeline
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{app.startup?.name}</h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              APP #{app.id}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold ${
              app.status === 'SHORTLISTED' || app.status === 'SELECTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
              app.status === 'NEEDS_REVISION' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}>
              {app.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Challenge Target: <span className="text-white font-medium">{app.challenge?.title}</span> · Track: {app.challenge?.category}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {app.deck_url && (
            <a
              href={app.deck_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" /> Pitch Deck
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
          {app.demo_video_url && (
            <a
              href={app.demo_video_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" /> Demo Video
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Venture Dossier & Problem Solution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Overview */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Venture Blueprint & Readiness
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Industry</span>
                <span className="text-white font-medium">{app.startup?.industry}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Maturity Stage</span>
                <span className="text-white font-medium">{app.startup?.stage}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Readiness Score</span>
                <span className="text-emerald-400 font-bold tabular-nums">{app.startup?.readiness_score || 75}/100</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">IP Protected</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  {app.startup?.ip_status || 'Provisional'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-1">Elevator Pitch</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0c1222] p-3 rounded-xl border border-slate-800/60">
                {app.startup?.elevator_pitch}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-300 mb-1">Problem Addressed</h3>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#0c1222] p-3 rounded-xl border border-slate-800/60 min-h-[90px]">
                  {app.startup?.problem_statement}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-300 mb-1">Proposed Solution & Moat</h3>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#0c1222] p-3 rounded-xl border border-slate-800/60 min-h-[90px]">
                  {app.startup?.solution_description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="bg-[#0c1222] p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">TARGET MARKET (TAM)</span>
                <span className="text-slate-200 font-medium">{app.startup?.target_market || '$2.5B Total'}</span>
              </div>
              <div className="bg-[#0c1222] p-3 rounded-xl border border-slate-800/60">
                <span className="text-slate-500 block text-[10px] font-mono">BUSINESS MODEL</span>
                <span className="text-slate-200 font-medium">{app.startup?.business_model || 'B2B SaaS / Usage'}</span>
              </div>
              <div className="bg-[#0c1222] p-3 rounded-xl border border-slate-800/60 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px] font-mono">CURRENT TRACTION</span>
                <span className="text-slate-200 font-medium">{app.startup?.traction_summary || 'Beta prototype deployed'}</span>
              </div>
            </div>
          </div>

          {/* Reviewer Scorecards & Completed Evaluations */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-500" />
                Judge Panel Evaluations ({app.assignments?.length || 0})
              </h2>
            </div>

            {app.assignments && app.assignments.length > 0 ? (
              <div className="space-y-4">
                {app.assignments.map((asg: any) => (
                  <div key={asg.id} className="p-4 rounded-xl bg-[#0c1222] border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <div>
                        <span className="text-xs font-bold text-white block">{asg.judge_name}</span>
                        <span className="text-[11px] text-slate-400 block">{asg.judge_org}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                          asg.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {asg.status}
                        </span>
                        {asg.evaluation && (
                          <span className="text-xs font-bold font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                            SCORE: {asg.evaluation.weighted_score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    {asg.evaluation ? (
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="text-slate-500 block">Innovation</span>
                            <span className="text-white font-bold">{asg.evaluation.innovation_score}/20</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="text-slate-500 block">Market</span>
                            <span className="text-white font-bold">{asg.evaluation.market_score}/15</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="text-slate-500 block">Tech Feasibility</span>
                            <span className="text-white font-bold">{asg.evaluation.feasibility_score}/20</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="text-slate-500 block">Recommendation</span>
                            <span className="text-emerald-400 font-bold">{asg.evaluation.recommendation}</span>
                          </div>
                        </div>

                        {asg.evaluation.strengths && (
                          <div className="text-slate-300">
                            <span className="text-emerald-400 font-medium">Strengths:</span> {asg.evaluation.strengths}
                          </div>
                        )}
                        {asg.evaluation.weaknesses && (
                          <div className="text-slate-300">
                            <span className="text-amber-400 font-medium">Critique:</span> {asg.evaluation.weaknesses}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Evaluation pending submission by reviewer.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No judges assigned yet. Assign reviewers below.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar: Status Decision Engine & Assignment */}
        <div className="space-y-6">
          {/* Status Override Decision Form */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
              <Award className="w-4 h-4" />
              Decision Control Cockpit
            </h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase">
                  Application Status Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="NEEDS_REVISION">NEEDS_REVISION</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="PITCH_SCHEDULED">PITCH_SCHEDULED</option>
                  <option value="PILOT">PILOT</option>
                  <option value="SELECTED">SELECTED (WINNER)</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase">
                  Revision Request Notes (Visible to Student)
                </label>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Specific requirements, deck updates, or financial clarification requested..."
                  className="w-full p-3 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase">
                  Internal Director Notes (Admin Only)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Confidential remarks, pilot funding partner notes..."
                  className="w-full p-3 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition disabled:opacity-50"
              >
                {updating ? 'Updating Status...' : 'Save & Broadcast Decision'}
              </button>
            </form>
          </div>

          {/* Quick Judge Assignment Panel */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-rose-500" />
              Assign Reviewers
            </h2>
            <p className="text-xs text-slate-400">
              Select verified domain judges to review this venture.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allJudges.map(judge => {
                const isSelected = selectedJudgeIds.includes(judge.id);
                return (
                  <button
                    key={judge.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedJudgeIds(selectedJudgeIds.filter(id => id !== judge.id));
                      } else {
                        setSelectedJudgeIds([...selectedJudgeIds, judge.id]);
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-rose-600/10 border-rose-500/50 text-white'
                        : 'bg-[#0c1222] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{judge.profile?.full_name || judge.email}</span>
                      <span className="text-[10px] text-slate-400 block">{judge.profile?.organization} · {judge.assigned_count || 0} active</span>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAssignJudges}
              disabled={assigning || selectedJudgeIds.length === 0}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 disabled:opacity-50 transition"
            >
              {assigning ? 'Assigning...' : `Assign (${selectedJudgeIds.length}) Reviewers`}
            </button>
          </div>

          {/* Applicant Founder Card */}
          <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Lead Applicant</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-rose-400">
                {app.applicant?.profile?.full_name?.[0] || 'F'}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{app.applicant?.profile?.full_name || 'Student Founder'}</span>
                <span className="text-[11px] text-slate-400 block">{app.applicant?.email}</span>
                <span className="text-[10px] text-slate-500 block">{app.applicant?.profile?.college_name || 'Institution Campus'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
