import React from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  ClipboardList,
  Scale,
  Video,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Founder Registration & Venture Profile',
      role: 'STUDENT FOUNDER',
      description: 'Founders create their startup profile, outline the problem statement, upload pitch decks, and assemble their multi-disciplinary team. Instant 50 Venture Coins awarded on registration.'
    },
    {
      step: '02',
      title: 'AI Readiness Audit & Stress Testing',
      role: 'AI STARTUP ASSISTANT',
      description: 'Before submitting, founders run their idea through the Gemini-powered AI Readiness Audit. The system highlights unit economics risks, competitive gaps, and validates TAM/SAM projections.'
    },
    {
      step: '03',
      title: 'Challenge Discovery & Submission',
      role: 'INNOVATION COMPETITION',
      description: 'Founders explore active challenges sponsored by industry consortia and university incubators. One-click submission assigns application status to SUBMITTED.'
    },
    {
      step: '04',
      title: 'Independent Reviewer Assignment',
      role: 'ADMINISTRATOR CONSOLE',
      description: 'Program directors review incoming submissions and assign two or more vetted industry judges with domain expertise. Review deadlines and conflict-of-interest checks are enforced.'
    },
    {
      step: '05',
      title: 'Shark Tank 7-Part Weighted Scoring',
      role: 'EXPERT JUDGES',
      description: 'Judges evaluate ventures in a split-screen workspace across 7 structured criteria (Innovation 20%, Problem Relevance 15%, Feasibility 20%, Market 15%, Scalability 15%, Team 10%, Pitch 5%). Scores are locked upon submission.'
    },
    {
      step: '06',
      title: 'Decision Consensus & Shortlisting',
      role: 'ADMINISTRATOR & JUDGE PANEL',
      description: 'Administrators inspect the automated scoreboard. Applications with score variance exceeding 25 points are flagged for panel reconciliation before official shortlisting.'
    },
    {
      step: '07',
      title: 'Live Pitch Session & Government SIH Sandbox',
      role: 'DEMO DAY ARENA',
      description: 'Shortlisted startups participate in scheduled live Shark Tank presentations with investor Q&A. Winners unlock grant funding, incubator admission, and government sandbox pilot trials.'
    }
  ];

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto space-y-16 font-sans">
      <div className="text-center space-y-4">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block">TRANSPARENT EVALUATION LIFECYCLE</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How PitchArena Works</h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          From first prototype concept to investor term sheet. See how our structured pipeline ensures merit-based evaluation and founder empowerment.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row gap-6 items-start hover:border-slate-700 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold text-lg flex items-center justify-center shrink-0">
              {s.step}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 uppercase">
                  {s.role}
                </span>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Ready to Pitch Your Venture?</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Create your account today, earn 50 welcome coins, and stress-test your concept with the AI assistant.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Get Started
          </Link>
          <Link
            to="/challenges"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Explore Challenges
          </Link>
        </div>
      </div>
    </div>
  );
};
