import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: 'Who can register and apply to challenges on PitchArena?',
      a: 'Any university student, recent graduate, or collegiate founder team can create a free account with the role STUDENT. You must provide a valid email and university affiliation.'
    },
    {
      q: 'How does the 7-part weighted evaluation engine work?',
      a: 'PitchArena enforces an objective evaluation standard across 7 specific criteria: Innovation & Originality (20%), Problem Relevance (15%), Technical Feasibility (20%), Market Potential (15%), Scalability (15%), Team Capability (10%), and Presentation Quality (5%). Scores from 0 to 10 are weighted on the backend to yield a score out of 100.'
    },
    {
      q: 'Are judge evaluations and comments confidential?',
      a: 'Yes. Judges input both public constructive feedback (which is released to students once decisions are finalized) and confidential administrative notes (visible only to platform directors and incubator staff).'
    },
    {
      q: 'What are Venture Coins and how do founders earn them?',
      a: 'Venture Coins are gamified platform tokens awarded for completing real entrepreneurial milestones: 50 coins upon registration, 50 coins for creating a startup profile, 50 coins for applying to challenges, and 200 coins for earning a shortlist. Coins rank founders on the public leaderboard and can unlock mentor office hours.'
    },
    {
      q: 'How does the AI Startup Assistant work?',
      a: 'The AI assistant uses Google Gemini models through a secure backend proxy to critique problem-solution clarity, suggest addressable market sizes, recommend business models, and identify technical vulnerabilities. Your API keys are never exposed in the browser.'
    },
    {
      q: 'How are judges appointed to the platform?',
      a: 'Judges are invited or provisioned exclusively by authorized platform administrators. Judges include venture capitalists, seasoned technology founders, and university incubator directors.'
    },
    {
      q: 'What is the Smart India Hackathon / Government Sandbox integration?',
      a: 'PitchArena is designed to support institutional and government innovation challenges, allowing shortlisted startups to transition directly into municipal pilot sandboxes with KPI tracking and procurement records.'
    }
  ];

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 lg:px-12 py-12 max-w-4xl mx-auto space-y-10 font-sans">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block">KNOWLEDGE BASE</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Everything you need to know about the PitchArena evaluation engine, coin economy, and competition rules.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search questions by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 transition"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between text-left gap-4"
            >
              <span className="text-sm font-semibold text-white">{item.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  openIdx === idx ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </button>
            {openIdx === idx && (
              <p className="pt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 mt-3">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
