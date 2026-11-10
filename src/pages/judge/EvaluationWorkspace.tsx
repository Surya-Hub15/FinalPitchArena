import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  Scale,
  ArrowLeft,
  FileText,
  Users,
  CheckCircle2,
  Lock,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  Globe,
  Award
} from 'lucide-react';

export const EvaluationWorkspace: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [workspaceData, setWorkspaceData] = useState<any>(null);

  // Scorecard state
  const [criterionScores, setCriterionScores] = useState<Record<number, number>>({});
  const [criterionNotes, setCriterionNotes] = useState<Record<number, string>>({});
  const [recommendation, setRecommendation] = useState<'SHORTLIST' | 'NEEDS_REVISION' | 'REJECT'>('SHORTLIST');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/api/judge/evaluate/${applicationId}`);
        if (res.success && res.data) {
          setWorkspaceData(res.data);
          // Initialize scores
          const initialScores: Record<number, number> = {};
          const initialNotes: Record<number, string> = {};

          if (res.data.existing_scores && res.data.existing_scores.length > 0) {
            res.data.existing_scores.forEach((s: any) => {
              initialScores[s.criteria_id] = parseFloat(s.score) || 7.0;
              initialNotes[s.criteria_id] = s.notes || '';
            });
          } else if (res.data.criteria) {
            res.data.criteria.forEach((c: any) => {
              initialScores[c.id] = 7.0;
              initialNotes[c.id] = '';
            });
          }

          setCriterionScores(initialScores);
          setCriterionNotes(initialNotes);

          if (res.data.existing_evaluation) {
            const ev = res.data.existing_evaluation;
            setRecommendation(ev.recommendation || 'SHORTLIST');
            setStrengths(ev.strengths || '');
            setWeaknesses(ev.weaknesses || '');
            setSuggestions(ev.suggestions || '');
            setConfidentialNotes(ev.confidential_admin_notes || '');
          }
        } else {
          setError(res.error || 'Access denied or application not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed loading evaluation workspace.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [applicationId]);

  // Compute live weighted score on the client for instant reviewer feedback
  const computeClientWeightedScore = (): number => {
    if (!workspaceData?.criteria) return 0;
    let total = 0;
    workspaceData.criteria.forEach((c: any) => {
      const score = criterionScores[c.id] ?? 7.0;
      const weightFraction = c.weight_percent / 100;
      total += score * weightFraction * 10;
    });
    return Math.min(100, Math.max(0, Math.round(total * 10) / 10));
  };

  const handleSaveEvaluation = async (isDraft: boolean) => {
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    const scoresPayload = Object.entries(criterionScores).map(([criteriaId, score]) => ({
      criteria_id: parseInt(criteriaId, 10),
      score,
      notes: criterionNotes[parseInt(criteriaId, 10)] || ''
    }));

    try {
      const res = await api.post('/api/judge/evaluations', {
        application_id: applicationId,
        scores: scoresPayload,
        recommendation,
        strengths,
        weaknesses,
        suggestions,
        confidential_admin_notes: confidentialNotes,
        is_draft: isDraft
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Evaluation saved successfully.');
        if (!isDraft) {
          // Re-fetch to update locked status
          const updated = await api.get(`/api/judge/evaluate/${applicationId}`);
          if (updated.success) setWorkspaceData(updated.data);
        }
      } else {
        setError(res.error || 'Failed saving evaluation.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading Shark Tank evaluation workspace...</div>;
  }

  if (error && !workspaceData) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
        <Link to="/judge/applications" className="text-xs text-emerald-400 hover:underline">
          Return to Assigned Applications
        </Link>
      </div>
    );
  }

  const { startup, challenge, team_members, criteria, existing_evaluation } = workspaceData;
  const isLocked = existing_evaluation?.is_locked;
  const currentWeighted = computeClientWeightedScore();

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto">
      {/* Top Breadcrumb & Lock Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/judge/applications" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Applications</span>
        </Link>
        {isLocked && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Scorecard Submitted & Locked (Score: {existing_evaluation.weighted_score}/100)</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Split-Screen Evaluation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Startup Dossier (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-semibold">
                  {challenge?.title}
                </span>
                <h1 className="text-2xl font-extrabold text-white">{startup?.name}</h1>
                <p className="text-xs text-slate-400">{startup?.tagline}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Stage</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-200">
                  {startup?.stage}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Industry: <strong className="text-slate-200">{startup?.industry}</strong></span>
              <span>Readiness Index: <strong className="text-cyan-400 font-mono">{startup?.readiness_score || 50}/100</strong></span>
            </div>
          </div>

          {/* Problem & Solution Accordion Cards */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Problem Statement
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{startup?.problem_statement}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Proposed Solution & Technology Moat
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{startup?.proposed_solution}</p>
          </div>

          {/* Business Model & Target Market */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Market</span>
              <p className="text-xs text-slate-300 leading-relaxed">{startup?.target_market || 'Not specified'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Business & Revenue Model</span>
              <p className="text-xs text-slate-300 leading-relaxed">{startup?.business_model || startup?.revenue_model || 'Not specified'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Competitor Landscape</span>
              <p className="text-xs text-slate-300 leading-relaxed">{startup?.competitors || 'Not specified'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Unique Selling Proposition (USP)</span>
              <p className="text-xs text-slate-300 leading-relaxed">{startup?.usp || 'Not specified'}</p>
            </div>
          </div>

          {/* Founding Team Credentials */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Founding Team ({team_members?.length || 1} Members)
            </h3>
            <div className="space-y-2">
              {team_members?.map((m: any) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{m.name}</span>
                    <span className="text-indigo-300 text-[11px]">{m.role_title} · {m.college || 'University'}</span>
                  </div>
                  {m.skills && Array.isArray(m.skills) && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {m.skills.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 7-Criteria Weighted Scorecard (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6 sticky top-20">
            {/* Live Weighted Scorecard Summary */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-semibold block">
                  Weighted Score Calculator
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                  {currentWeighted}
                  <span className="text-sm text-slate-500">/100</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Recommendation</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  recommendation === 'SHORTLIST'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : recommendation === 'NEEDS_REVISION'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {recommendation}
                </span>
              </div>
            </div>

            {/* Criteria Sliders */}
            <div className="space-y-5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Evaluation Rubric (Score 0 to 10 each)
              </span>

              {criteria?.map((c: any) => {
                const currentScore = criterionScores[c.id] ?? 7.0;
                return (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{c.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Weight: {c.weight_percent}%</span>
                      </div>
                      <span className="text-base font-bold font-mono text-cyan-400 tabular-nums">
                        {currentScore.toFixed(1)} / 10
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      disabled={isLocked}
                      value={currentScore}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCriterionScores(prev => ({ ...prev, [c.id]: val }));
                      }}
                      className="w-full accent-emerald-500 cursor-pointer disabled:opacity-50"
                    />

                    <p className="text-[11px] text-slate-400 leading-tight">
                      {c.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">
                  Key Strengths (Released to Founder)
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="What makes this venture compelling and defensible?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">
                  Vulnerabilities & Risk Factors (Released to Founder)
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="What risks, unit economics, or execution hurdles must be addressed?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">
                  Actionable Founder Guidance (Released to Founder)
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Specific next steps for the founder to improve."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-rose-300 font-semibold block flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span>Confidential Notes (Admin & Committee Only)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Never visible to founder</span>
                </div>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={confidentialNotes}
                  onChange={(e) => setConfidentialNotes(e.target.value)}
                  placeholder="Private investment evaluation for committee deliberation..."
                  className="w-full px-3 py-2 bg-slate-950 border border-rose-900/40 rounded-lg text-xs text-white disabled:opacity-50"
                />
              </div>

              {/* Recommendation Dropdown */}
              <div className="space-y-1 pt-2">
                <label className="text-xs text-slate-300 font-medium block">Final Official Recommendation</label>
                <select
                  disabled={isLocked}
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase disabled:opacity-50"
                >
                  <option value="SHORTLIST">SHORTLIST (Advance to Round 2 & Demo Day)</option>
                  <option value="NEEDS_REVISION">NEEDS REVISION (Request Deck Refinements)</option>
                  <option value="REJECT">REJECT (Does not meet competition criteria)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              {!isLocked ? (
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveEvaluation(true)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSaveEvaluation(false)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>Lock & Submit Score</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 text-center font-mono">
                  This scorecard was finalized on {new Date(existing_evaluation.submitted_at || Date.now()).toLocaleDateString()}. Locked by protocol.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
