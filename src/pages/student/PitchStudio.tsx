import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import {
  Presentation,
  Sparkles,
  CheckCircle2,
  ListOrdered,
  FileText,
  Copy,
  Download,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export const PitchStudio: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [pitchData, setPitchData] = useState({
    title: 'TerraPulse IoT Chiller Modulation',
    tagline: 'Autonomous AI-driven energy optimization for commercial urban towers',
    problem: 'Commercial skyscrapers waste 30% of their annual HVAC energy due to static schedule-based chiller operations that ignore live occupant density and ambient heat gain.',
    solution: 'TerraPulse integrates plug-and-play wireless BACnet sensor pods with an edge neural predictive controller that dynamically modulates chiller valves, slashing cooling bills by 28%.',
    market: 'Class A & B commercial real estate asset managers, university hospital campuses, and corporate parks ($14B SAM).',
    business_model: 'Hardware lease ($1,200 installation) + $450/month per building SaaS subscription + 15% shared energy savings bonus.',
    technology: 'ESP32-S3 microcontroller cluster with low-power LoRaWAN mesh and on-device quantized reinforcement learning policy.',
    competition: 'Johnson Controls Metasys, Honeywell Forge, manual thermostat schedules. We install in 3 hours with sub-12 month payback.',
    traction: 'Alpha bench test completed with 28% simulated reduction; 1 pilot installation active in University Engineering Hall.',
    team: 'Alex Vance (Embedded Systems & CEO), Sarah Lin (ML & BACnet), Carlos Ruiz (Industrial Design).',
    financials: 'Targeting $480k ARR by Year 2 with 82% software gross margins and $3,500 LTV per commercial building.'
  });

  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const slides = [
    { id: 'problem', name: 'Slide 1: Problem & Customer Pain', key: 'problem' },
    { id: 'solution', name: 'Slide 2: Proposed Solution & Value', key: 'solution' },
    { id: 'market', name: 'Slide 3: Market Size & TAM/SAM', key: 'market' },
    { id: 'business_model', name: 'Slide 4: Business Model & Pricing', key: 'business_model' },
    { id: 'technology', name: 'Slide 5: Technology Architecture & Moat', key: 'technology' },
    { id: 'competition', name: 'Slide 6: Competitive Landscape', key: 'competition' },
    { id: 'traction', name: 'Slide 7: Traction & Pilot Milestones', key: 'traction' },
    { id: 'team', name: 'Slide 8: Founder Team Credentials', key: 'team' },
    { id: 'financials', name: 'Slide 9: Financial Projections & Unit Econ', key: 'financials' }
  ];

  const handleGenerateElevatorPitch = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/api/ai/improve-pitch', {
        title: pitchData.title,
        problem: pitchData.problem,
        solution: pitchData.solution,
        market: pitchData.market,
        business_model: pitchData.business_model
      });
      if (res.success && res.data) {
        setAiSuggestions(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const copyElevatorPitch = () => {
    if (aiSuggestions?.elevator_pitch) {
      navigator.clipboard.writeText(aiSuggestions.elevator_pitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentSlide = slides[activeSlide];

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">FOUNDER WORKSPACE</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Presentation Builder</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Presentation className="w-6 h-6 text-indigo-400" />
            <span>Pitch Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Structure your 10-slide Shark Tank pitch deck, craft elevator pitches, and prepare for investor Q&A.
          </p>
        </div>

        <button
          onClick={handleGenerateElevatorPitch}
          disabled={generating}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{generating ? 'Generating AI Critique...' : 'AI Pitch Enhancement'}</span>
        </button>
      </div>

      {/* AI Elevator Pitch Result Banner if Generated */}
      {aiSuggestions && (
        <div className="p-6 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>AI-Generated 30-Second Elevator Pitch:</span>
            </div>
            <button
              onClick={copyElevatorPitch}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy Pitch'}</span>
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed bg-[#0b0f19] p-4 rounded-xl border border-slate-800 font-mono text-xs">
            "{aiSuggestions.elevator_pitch}"
          </p>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Slide Deck Navigator (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 block px-2 mb-1">
            Slide Architecture (10 Slides)
          </span>
          <div className="space-y-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                  activeSlide === idx
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                    : 'bg-[#0f172a] text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                <span className="truncate">{s.name}</span>
                <span className="text-[10px] font-mono opacity-60">0{idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Deck Checklist */}
          <div className="pt-4 p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3 text-xs">
            <span className="font-bold text-white block">Investor Checklist</span>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Problem anchored in financial loss</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bottom-up TAM/SAM sizing defined</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Technological defensibility & moat</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                <span>3 Customer pilot testimonial letters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Editor & Visual Canvas (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">Slide Editor</span>
                <h2 className="text-xl font-bold text-white">{currentSlide.name}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
                Slide {activeSlide + 1} of {slides.length}
              </span>
            </div>

            {/* Slide Text Content Input */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Slide Narrative & Bulleted Proof Points:
              </label>
              <textarea
                rows={6}
                value={(pitchData as any)[currentSlide.key] || ''}
                onChange={(e) => setPitchData({ ...pitchData, [currentSlide.key]: e.target.value })}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white leading-relaxed font-sans focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Slide Presentation Preview Frame */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-[#0b0f19] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>SLIDE PREVIEW · 16:9 PROJECTION</span>
                <span>{pitchData.title}</span>
              </div>
              <h3 className="text-base font-bold text-white">{currentSlide.name.replace(/Slide \d+: /, '')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {(pitchData as any)[currentSlide.key] || 'No content entered yet.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={activeSlide === 0}
                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-lg text-xs font-semibold"
              >
                Previous Slide
              </button>
              <button
                type="button"
                disabled={activeSlide === slides.length - 1}
                onClick={() => setActiveSlide(prev => Math.min(slides.length - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Next Slide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
