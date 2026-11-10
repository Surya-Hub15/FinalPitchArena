import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Scale,
  Award,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  BarChart2
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const standoutFeatures = [
    {
      icon: Bot,
      title: 'AI Startup Readiness Score (0–100)',
      tag: 'Algorithmic Venture Audit',
      description: 'An AI-powered multi-factor readiness evaluation measuring problem clarity, technological feasibility, TAM/SAM sizing, unit economics, and team capability. Highlights actionable gaps before submitting to live judges.'
    },
    {
      icon: Scale,
      title: 'Shark Tank-Style Evaluation Workspace',
      tag: 'Weighted 7-Part Rubric',
      description: 'Reviewers evaluate applications with split-screen deck review and weighted rubrics (Innovation 20%, Problem Relevance 15%, Feasibility 20%, Market Potential 15%, Scalability 15%, Team 10%, Pitch Quality 5%).'
    },
    {
      icon: Zap,
      title: 'Smart Challenge Semantic Matching',
      tag: 'AI Recommendation Engine',
      description: 'Analyzes your startup profile, industry stage, and technical stack to recommend open innovation challenges with quantified alignment percentages and specific justification rationale.'
    },
    {
      icon: Award,
      title: 'Gamified Venture Coins & Badges',
      tag: 'Founder Motivation System',
      description: 'Earn coins for creating startups, completing customer validation interviews, publishing bench tests, and earning challenge shortlists. Redeem for mentor office hours and showcase spotlights.'
    },
    {
      icon: Layers,
      title: 'Visual 10-Stage Milestone Roadmap',
      tag: 'From Idea to Seed Scale',
      description: 'Guided step-by-step roadmap from Problem Discovery to Government SIH Sandbox and venture seed capital. Founders upload verified evidence notes at each milestone.'
    },
    {
      icon: Shield,
      title: 'Transparent Multi-Judge Decision Pipeline',
      tag: 'Tamper-Evident Governance',
      description: 'Confidential judge comments remain private, while authorized actionable feedback is released to students upon round completion. Every action is recorded in an immutable audit log.'
    }
  ];

  return (
    <div className="px-6 lg:px-12 py-12 max-w-7xl mx-auto space-y-16 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block">PLATFORM CAPABILITIES</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Engineered as a Complete Startup Accelerator & Pitch Ecosystem
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          PitchArena is not just a form submission tool. It is an end-to-end venture validation engine combining institutional scoring rigor with gamified founder incentives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {standoutFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fully integrated with backend APIs</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white">Experience PitchArena in Action</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Test any role instantly or create a student account to validate your startup idea with the AI assistant.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Create Founder Account
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Try Demo Login
          </Link>
        </div>
      </div>
    </div>
  );
};
