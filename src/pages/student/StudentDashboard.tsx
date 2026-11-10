import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  Rocket,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Bot,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/student/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed fetching student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading founder dashboard...</div>;
  }

  const stats = data?.stats || {};
  const profile = data?.profile || {};

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-[#0f172a] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">FOUNDER DASHBOARD</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">{profile.college_name || 'Innovation Campus'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {profile.full_name || 'Founder'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Track your innovation challenges, stress-test pitch decks with the AI assistant, and level up your venture roadmap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/student/startups"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <Rocket className="w-4 h-4" />
            <span>Create Startup (+50)</span>
          </Link>
          <Link
            to="/student/ai-assistant"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold transition flex items-center gap-2 border border-slate-700"
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>My Startups</span>
            <Rocket className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">{stats.total_startups || 0}</span>
          <span className="text-[11px] text-slate-500 block">Registered venture profiles</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Submitted Applications</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">{stats.total_applications || 0}</span>
          <span className="text-[11px] text-slate-500 block">Active challenge bids</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Shortlisted Contenders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{stats.shortlisted || 0}</span>
          <span className="text-[11px] text-slate-500 block">Advanced to Round 2</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Venture Coins</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{stats.total_coins || 50}</span>
          <span className="text-[11px] text-slate-500 block">Earned achievement tokens</span>
        </div>
      </div>

      {/* Main Grid: Application Pipeline & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Application Pipeline & Tracking</h2>
            <Link to="/student/applications" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recent_applications?.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 text-center space-y-3">
              <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">You haven't submitted any challenge applications yet.</p>
              <Link
                to="/student/challenges"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Explore Active Challenges
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_applications.map((app: any) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.startup_name}</span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-xs text-indigo-300">{app.challenge_title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Submitted on {new Date(app.submitted_at).toLocaleDateString()} · Round {app.current_round}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase ${
                        app.status === 'SHORTLISTED' || app.status === 'SELECTED'
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
                    <Link
                      to={`/student/applications/${app.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Challenges */}
          <div className="pt-4 space-y-4">
            <h2 className="text-base font-bold text-white">Recommended for Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.recommended_challenges?.map((ch: any) => (
                <div key={ch.id} className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-indigo-400 font-medium">{ch.organization}</span>
                    <span className="font-mono text-[11px]">{ch.prize_pool}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{ch.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{ch.problem_statement}</p>
                  <Link
                    to={`/student/challenges/${ch.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline pt-1"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Sessions & Startup Readiness */}
        <div className="space-y-6">
          {/* AI Readiness Box */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Startup Readiness Radar</h3>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
                  {stats.startup_readiness_score || 45}
                  <span className="text-sm text-slate-500">/100</span>
                </span>
                <span className="text-xs text-slate-400 block">Venture Maturity Index</span>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 flex items-center justify-center font-bold text-xs text-white font-mono">
                {stats.startup_readiness_score || 45}%
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Completing customer validation interviews and hardware bench test milestones increases your readiness index.
            </p>

            <Link
              to="/student/roadmap"
              className="block text-center py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Open Venture Roadmap
            </Link>
          </div>

          {/* Upcoming Pitch Sessions */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Scheduled Shark Tank Pitches</h3>
            {data?.upcoming_sessions?.length === 0 ? (
              <p className="text-xs text-slate-500">No live pitch sessions currently scheduled.</p>
            ) : (
              <div className="space-y-3">
                {data.upcoming_sessions.map((sess: any) => (
                  <div key={sess.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-white block">{sess.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{new Date(sess.scheduled_at).toLocaleString()}</span>
                    </div>
                    <a
                      href={sess.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
                    >
                      Join Virtual Arena
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
