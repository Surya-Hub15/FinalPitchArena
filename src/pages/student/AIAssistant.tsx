import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Bot,
  Send,
  Sparkles,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  Lightbulb,
  Compass,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  analysis?: any;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hello Founder! I am your PitchArena AI Startup Mentor powered by Gemini. Share your concept, problem statement, or target industry. I can audit your business model, calculate your readiness score, stress-test your defensibility, and match you with open innovation challenges.'
    }
  ]);

  const [inputProblem, setInputProblem] = useState('');
  const [inputSolution, setInputSolution] = useState('');
  const [inputIndustry, setInputIndustry] = useState('CleanTech & IoT');
  const [inputName, setInputName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quick preset ideas for instant testing
  const presets = [
    {
      name: 'AquaPulse Hydro',
      industry: 'CleanTech & IoT',
      problem: 'Municipal clean water networks lose 32% of treated volume through undetected micro-fractures in underground pipes.',
      solution: 'Acoustic IoT sensor pods clamped to fire hydrants that listen for pipe vibrations and triangulate leaks via edge machine learning.'
    },
    {
      name: 'NeuroScreen Vision',
      industry: 'HealthTech & AI',
      problem: 'Primary care clinics in remote areas lack access to specialized neurology experts for early Alzheimer biomarker detection.',
      solution: 'Smartphone-based ocular micro-saccade tracking app analyzing eye movements during a 60-second visual quiz.'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setInputName(p.name);
    setInputIndustry(p.industry);
    setInputProblem(p.problem);
    setInputSolution(p.solution);
  };

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputProblem.trim() || !inputSolution.trim()) return;

    const userText = `Concept: ${inputName || 'New Venture'}\nIndustry: ${inputIndustry}\nProblem: ${inputProblem}\nSolution: ${inputSolution}`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      const res = await api.post('/api/ai/analyze-idea', {
        name: inputName,
        industry: inputIndustry,
        problem_statement: inputProblem,
        proposed_solution: inputSolution
      });

      if (res.success && res.data) {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          analysis: res.data
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Apologies, I encountered an issue analyzing your concept. Please verify your input details and try again.'
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Network error communicating with the AI service. Please retry in a few moments.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">STANDOUT FEATURE</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Gemini Flash Integration</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span>AI Startup Assistant & Venture Auditor</span>
          </h1>
          <p className="text-xs text-slate-400">
            Stress-test concepts, analyze unit economics, detect competitor vulnerabilities, and receive actionable validation milestones.
          </p>
        </div>

        {/* Disclaimer Tag */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 max-w-xs">
          <span className="text-amber-400 font-semibold block">Notice:</span>
          Suggestions are AI-generated for ideation guidance and do not substitute for formal market validation.
        </div>
      </div>

      {/* Concept Formulation Input Form */}
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
            Define Startup Concept to Audit
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">Try preset:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium block">Venture Name (Optional)</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. TerraPulse"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-300 font-medium block">Industry / Sector</label>
              <select
                value={inputIndustry}
                onChange={(e) => setInputIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="CleanTech & IoT">CleanTech & IoT</option>
                <option value="HealthTech & AI">HealthTech & AI</option>
                <option value="Fintech & Web3">Fintech & Web3</option>
                <option value="AgriTech & Food">AgriTech & Food</option>
                <option value="Enterprise SaaS & AI">Enterprise SaaS & AI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium block">Problem Statement *</label>
              <textarea
                required
                rows={3}
                value={inputProblem}
                onChange={(e) => setInputProblem(e.target.value)}
                placeholder="What critical customer pain point, inefficiency, or loss are you addressing?"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium block">Proposed Solution & Moat *</label>
              <textarea
                required
                rows={3}
                value={inputSolution}
                onChange={(e) => setInputSolution(e.target.value)}
                placeholder="How does your technology solve it? Why is it 10x better or defensible?"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Run Comprehensive AI Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Conversation & Analysis Feed */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-white">Analysis & Consultation Feed</h3>

        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl border transition ${
                msg.sender === 'user'
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-[#0f172a] border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  {msg.sender === 'assistant' ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                      YOU
                    </div>
                  )}
                  <span className="font-bold text-white">
                    {msg.sender === 'assistant' ? 'PitchArena AI Mentor' : 'Founder Submission'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{msg.timestamp}</span>
              </div>

              {msg.text && (
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>
              )}

              {/* Rich Analysis Card Render */}
              {msg.analysis && (
                <div className="space-y-6 pt-3">
                  {/* Readiness Score Banner */}
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-cyan-400 block">AI Estimated Readiness Score</span>
                      <span className="text-2xl font-bold font-mono text-white tabular-nums">
                        {msg.analysis.estimated_readiness_score || 78}/100
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 max-w-xs text-right">
                      {msg.analysis.is_ai_generated ? 'Generated by Gemini 2.5 Flash' : 'Calculated by PitchArena Heuristics Engine'}
                    </span>
                  </div>

                  {/* Problem & Solution Critiques */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                        <Target className="w-4 h-4" />
                        <span>Problem Urgency Analysis</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{msg.analysis.problem_analysis}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Solution & Defensibility</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{msg.analysis.proposed_solution_analysis}</p>
                    </div>
                  </div>

                  {/* Target Customers & Business Models */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-white block">Recommended Target Segments:</span>
                      <ul className="space-y-1">
                        {msg.analysis.target_customers?.map((c: string, cIdx: number) => (
                          <li key={cIdx} className="text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-white block">Potential Monetization Models:</span>
                      <ul className="space-y-1">
                        {msg.analysis.potential_business_models?.map((bm: string, bmIdx: number) => (
                          <li key={bmIdx} className="text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span>{bm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-emerald-400 block">Identified Moats & Strengths:</span>
                      <ul className="space-y-1">
                        {msg.analysis.strengths?.map((s: string, sIdx: number) => (
                          <li key={sIdx} className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="font-bold text-rose-400 block">Key Risks & Competitor Hazards:</span>
                      <ul className="space-y-1">
                        {msg.analysis.weaknesses?.map((w: string, wIdx: number) => (
                          <li key={wIdx} className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-rose-400">⚠</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Validation Checklist */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <ListChecks className="w-4 h-4" />
                      <span>Recommended Validation Checklist:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {msg.analysis.validation_checklist?.map((chk: string, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#0b0f19] border border-slate-800 text-slate-300 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{chk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
