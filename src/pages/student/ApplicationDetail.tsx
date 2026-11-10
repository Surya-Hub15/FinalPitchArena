import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Video,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Revision state
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState(false);

  useEffect(() => {
    const fetchAppDetail = async () => {
      try {
        const res = await api.get(`/api/student/applications/${id}`);
        if (res.success && res.data) {
          setApp(res.data);
        }
      } catch (err) {
        console.error('Failed fetching application details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppDetail();
  }, [id]);

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRevision(true);
    try {
      const res = await api.put(`/api/student/applications/${id}/revise`, {
        notes: revisionNotes
      });
      if (res.success) {
        setRevisionSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRevision(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading application tracking cockpit...</div>;
  }

  if (!app) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Application Record Not Found</h2>
        <Link to="/student/applications" className="text-xs text-indigo-400 hover:underline">
          Return to Applications
        </Link>
      </div>
    );
  }

  const stages = [
    { key: 'SUBMITTED', label: '1. Submitted' },
    { key: 'UNDER_REVIEW', label: '2. Under Review' },
    { key: 'SHORTLISTED', label: '3. Shortlisted' },
    { key: 'PITCH_SCHEDULED', label: '4. Pitch Scheduled' },
    { key: 'PILOT', label: '5. Pilot / Winner' }
  ];

  const getStageIndex = (status: string) => {
    if (status === 'SUBMITTED') return 0;
    if (status === 'UNDER_REVIEW') return 1;
    if (status === 'NEEDS_REVISION') return 1;
    if (status === 'SHORTLISTED') return 2;
    if (status === 'PITCH_SCHEDULED' || status === 'PITCH_COMPLETED') return 3;
    if (status === 'PILOT' || status === 'SELECTED') return 4;
    return 1;
  };

  const currentStageIdx = getStageIndex(app.status);

  return (
    <div className="space-y-8 font-sans">
      <Link to="/student/applications" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Applications</span>
      </Link>

      {/* Header Cockpit Card */}
      <div className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
                Application #{app.id}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Round {app.current_round}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {app.startup?.name}
            </h1>
            <p className="text-xs text-slate-300">
              Submitted to: <strong className="text-indigo-400">{app.challenge?.title}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase ${
                app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'PILOT'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : app.status === 'NEEDS_REVISION'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : app.status === 'REJECTED'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              Status: {app.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Visual Multi-Step Progress Tracker */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <span className="text-xs font-mono text-slate-400 uppercase block">Evaluation Progress:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded-xl border text-xs font-medium space-y-1 ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{stage.label}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revision Request Banner */}
      {app.status === 'NEEDS_REVISION' && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Action Required: The review committee requested revisions</span>
          </div>
          <p className="text-slate-300">
            {app.revision_notes || 'Please update your pitch deck slides with bottom-up market sizing and customer interview evidence.'}
          </p>

          {revisionSuccess ? (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg font-medium">
              Revision submitted successfully! Reviewers have been notified.
            </div>
          ) : (
            <form onSubmit={handleRevisionSubmit} className="space-y-3 pt-2">
              <label className="text-slate-200 block font-semibold">Your Updated Revision Notes / Deck Link:</label>
              <textarea
                rows={3}
                required
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Detail what changes you have made and provide updated links..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
              />
              <button
                type="submit"
                disabled={submittingRevision}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Revisions to Judges</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Grid: Released Judge Feedback & Live Pitch Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Authorized Judge Feedback */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Authorized Review Committee Feedback</h2>
              <span className="text-[10px] text-slate-400 font-mono">Released to Founders</span>
            </div>

            {app.released_feedback?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <Clock className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                <p>Reviews are currently in progress by independent expert judges.</p>
                <p className="text-slate-600">Actionable feedback will be released upon round conclusion.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {app.released_feedback.map((fb: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-400">{fb.reviewer_label}</span>
                      <span className="font-mono text-emerald-400 uppercase font-semibold">
                        Recommendation: {fb.recommendation}
                      </span>
                    </div>

                    {fb.strengths && (
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block">Key Strengths:</span>
                        <p className="text-slate-200 leading-relaxed bg-[#0b0f19] p-3 rounded-lg border border-slate-800/80">
                          {fb.strengths}
                        </p>
                      </div>
                    )}

                    {fb.weaknesses && (
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block">Areas for Development:</span>
                        <p className="text-slate-200 leading-relaxed bg-[#0b0f19] p-3 rounded-lg border border-slate-800/80">
                          {fb.weaknesses}
                        </p>
                      </div>
                    )}

                    {fb.suggestions && (
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block">Reviewer Guidance & Next Steps:</span>
                        <p className="text-slate-200 leading-relaxed bg-[#0b0f19] p-3 rounded-lg border border-slate-800/80">
                          {fb.suggestions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Pitch Sessions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Live Shark Tank Sessions</h3>

            {app.pitch_sessions?.length === 0 ? (
              <p className="text-xs text-slate-500">No live pitch session scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {app.pitch_sessions.map((sess: any) => (
                  <div key={sess.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <span className="text-xs font-semibold text-white block">{sess.title}</span>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(sess.scheduled_at).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Duration: {sess.duration_minutes} mins · Venue: {sess.venue}
                    </div>
                    <a
                      href={sess.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition mt-2"
                    >
                      Join Virtual Presentation
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white">Need Pitch Assistance?</h4>
            <p className="text-slate-400 leading-relaxed">
              Use Pitch Studio to generate 10-slide venture presentations and elevator pitches.
            </p>
            <Link
              to="/student/pitch-studio"
              className="block text-center py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg font-semibold transition"
            >
              Open Pitch Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
