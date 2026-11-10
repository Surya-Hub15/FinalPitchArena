import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  Rocket,
  ShieldCheck,
  Bot,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Flame,
  Scale
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    total_founders: 420,
    total_judges: 65,
    total_startups: 180,
    active_challenges: 3,
    total_prize_pool_awarded: '$125,000+'
  });
  const [featuredChallenges, setFeaturedChallenges] = useState<any[]>([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const statsRes = await api.get('/api/public/stats');
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        const chRes = await api.get('/api/public/challenges');
        if (chRes.success && Array.isArray(chRes.data)) {
          setFeaturedChallenges(chRes.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching public homepage data', err);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-8 lg:pt-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Startup Innovation & Evaluation Arena</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              Turn Your Startup Idea Into <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Reality</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
              PitchArena connects ambitious student founders with industry judges, venture capitalists, and innovation challenges through a transparent, gamified evaluation platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
              >
                <span>Submit Your Startup</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/challenges"
                className="px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-xl hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore Challenges</span>
              </Link>
            </div>

            {/* Quick 3-Role Value Strip */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-semibold text-white block">Student Founders</span>
                <span className="text-slate-400 text-[11px]">AI pitch assistant & coins</span>
              </div>
              <div>
                <span className="font-semibold text-white block">Expert Judges</span>
                <span className="text-slate-400 text-[11px]">7-criteria weighted rubric</span>
              </div>
              <div>
                <span className="font-semibold text-white block">Program Admins</span>
                <span className="text-slate-400 text-[11px]">Pipeline & results control</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-indigo-950/50 group">
              <img
                src="/src/assets/images/hero_pitch_arena_1794284947999.jpg"
                alt="PitchArena Live Competition Stage"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Live Shark Tank Competition Stage</span>
                  <span className="text-[11px] text-slate-400">Independent multi-judge review engine</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Counters Strip */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">{stats.total_founders || 420}+</span>
            <span className="text-xs text-slate-400 block font-sans">Active Founders</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400 tabular-nums">{stats.total_startups || 180}+</span>
            <span className="text-xs text-slate-400 block font-sans">Registered Startups</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tabular-nums">{stats.total_judges || 65}+</span>
            <span className="text-xs text-slate-400 block font-sans">Industry Judges</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">{stats.active_challenges || 3}</span>
            <span className="text-xs text-slate-400 block font-sans">Live Competitions</span>
          </div>
          <div className="space-y-1 col-span-2 lg:col-span-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">{stats.total_prize_pool_awarded || '$125k+'}</span>
            <span className="text-xs text-slate-400 block font-sans">Grants & Sandbox Funding</span>
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block mb-1">COMPETITION ARENA</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Active Innovation Challenges</h2>
          </div>
          <Link to="/challenges" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <span>View All Challenges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-indigo-400 font-medium">{challenge.organization}</span>
                  <span className="font-mono">{challenge.category}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {challenge.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {challenge.problem_statement}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Prize Pool:</span>
                  <span className="text-emerald-400 font-semibold">{challenge.prize_pool}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due: {challenge.deadline}</span>
                  </div>
                  <Link
                    to={`/challenges/${challenge.id}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>Apply</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Standout Features & Shark Tank Evaluation Workspace */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">NEXT-GEN STARTUP ECOSYSTEM</span>
          <h2 className="text-3xl font-bold text-white">Engineered for Venture Excellence</h2>
          <p className="text-slate-400 text-sm">
            PitchArena replaces opaque email submissions with an end-to-end transparent scoring pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Startup Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stress-test your concept with Gemini AI. Receive bottom-up market sizing, competitor risk analysis, and automated pitch slide enhancements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Shark Tank Evaluation Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reviewers assess ventures using an objective 7-part weighted scorecard (Innovation 20%, Technical Feasibility 20%, Scalability 15%, etc.).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Gamified Coins & Badges</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Founders earn venture coins and digital milestone badges for completing customer discovery, bench tests, and achieving competition shortlists.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="p-10 lg:p-14 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl font-extrabold text-white">Ready to Step Into the Arena?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join hundreds of collegiate innovators, founders, and expert judges building the future of deep-tech and sustainable ventures.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30"
            >
              Register as Founder
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
