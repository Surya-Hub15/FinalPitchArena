import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Video,
  ArrowRight,
  ShieldCheck,
  Scale,
  Calendar,
  Layers
} from 'lucide-react';

export const JudgeDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/judge/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed fetching judge dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading reviewer console...</div>;
  }

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const upcomingSessions = data?.upcoming_sessions || [];
  const recentEvaluations = data?.recent_evaluations || [];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-[#0f172a] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">REVIEWER & VC CONSOLE</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{profile.organization || 'Apex Horizon Ventures'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {profile.full_name || 'Reviewer'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Evaluate assigned collegiate ventures with objective 7-criteria weighted rubrics and deliver feedback to founders.
          </p>
        </div>

        <Link
          to="/judge/applications"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-emerald-600/30 shrink-0"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Open Review Queue</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Assigned</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">{stats.total_assigned || 0}</span>
          <span className="text-[11px] text-slate-500 block">Assigned applications</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Reviews</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{stats.pending_reviews || 0}</span>
          <span className="text-[11px] text-slate-500 block">Awaiting evaluation</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed Evaluations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{stats.completed_reviews || 0}</span>
          <span className="text-[11px] text-slate-500 block">Submitted scorecards</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Pitch Sessions</span>
            <Video className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{stats.upcoming_sessions_count || 0}</span>
          <span className="text-[11px] text-slate-500 block">Scheduled presentations</span>
        </div>
      </div>

      {/* Main Grid: Pending Queue & Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Evaluation Queue</h2>
            <Link to="/judge/applications" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              <span>View All Assigned</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Judges evaluate assigned startups through a split-screen workspace with simultaneous access to problem statements, team profiles, pitch decks, and a structured 7-criteria scorecard.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/judge/applications"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Start Next Evaluation
              </Link>
              <Link
                to="/judge/history"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Review Submitted History
              </Link>
            </div>
          </div>

          {/* Recently Evaluated */}
          {recentEvaluations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white">Recent Completed Evaluations</h3>
              <div className="space-y-2">
                {recentEvaluations.map((ev: any) => (
                  <div key={ev.id} className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{ev.startup_name}</span>
                      <span className="text-slate-400 text-[11px]">{ev.industry} · Recommendation: {ev.recommendation}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400 text-sm">{ev.weighted_score}/100</span>
                      <span className="text-[10px] text-slate-500 block">Locked Score</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Sessions & Evaluation Rules */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Live Pitch Sessions</h3>
            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-slate-500">No pitch sessions currently scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((s: any) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-white block">{s.title}</span>
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(s.scheduled_at).toLocaleString()}</span>
                    </div>
                    <a
                      href={s.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition"
                    >
                      Join Session
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Scoring Discipline</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Final Score = Sum of (Score × Weight) / 10 × 10. Once submitted, your scorecard is locked to prevent retrospective tampering unless unlocked by the administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
