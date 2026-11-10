import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Shield, Users, Target, Rocket } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto space-y-16 font-sans">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block">OUR PURPOSE</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">About PitchArena</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          PitchArena was founded to solve a pervasive problem in collegiate entrepreneurship: opaque evaluation, subjective selection, and the chasm between classroom innovation and institutional venture funding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Transparent Meritocracy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every submission is judged against an open, published 7-criteria weighted rubric by multiple independent domain specialists.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Founder Acceleration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We provide gamified venture milestones, AI idea stress-testing, and direct feedback so student founders build defensible, investable startups.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Institutional Rigor</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our platform provides university incubators and government challenges with full audit logs, variance detection, and sandbox deployment pipelines.
          </p>
        </div>
      </div>
    </div>
  );
};
