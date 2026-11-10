import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  Rocket,
  Plus,
  Users,
  FileCheck,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MyStartups: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    industry: 'CleanTech & IoT',
    stage: 'IDEA',
    problem_statement: '',
    proposed_solution: '',
    target_market: '',
    business_model: '',
    revenue_model: '',
    competitors: '',
    usp: '',
    website_url: '',
    pitch_deck_url: ''
  });

  const loadStartups = async () => {
    try {
      const res = await api.get('/api/student/startups');
      if (res.success && Array.isArray(res.data)) {
        setStartups(res.data);
      }
    } catch (err) {
      console.error('Failed loading startups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStartups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.problem_statement || !formData.proposed_solution) {
      setError('Please fill in startup name, problem statement, and proposed solution.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await api.post('/api/student/startups', formData);
      if (res.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          tagline: '',
          industry: 'CleanTech & IoT',
          stage: 'IDEA',
          problem_statement: '',
          proposed_solution: '',
          target_market: '',
          business_model: '',
          revenue_model: '',
          competitors: '',
          usp: '',
          website_url: '',
          pitch_deck_url: ''
        });
        loadStartups();
      } else {
        setError(res.error || 'Failed creating startup profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Startups & Ventures</h1>
          <p className="text-xs text-slate-400">Manage your venture profiles, readiness evaluations, and associated challenge bids.</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setError(''); }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Startup (+50 Coins)</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading startup profiles...</div>
      ) : startups.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
          <Rocket className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Create Your First Startup Profile</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Register your venture concept to receive an automated AI readiness score, unlock 50 bonus coins, and apply to live competitions.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Startup Profile</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {startups.map(s => (
            <div
              key={s.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                      {s.industry}
                    </span>
                    <h3 className="text-xl font-bold text-white">{s.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300">
                      {s.stage}
                    </span>
                    <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-mono text-[11px] font-bold">
                      {s.readiness_score || 50}/100
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {s.tagline || s.problem_statement}
                </p>

                <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{s.applications_count || 0} Challenge Applications</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{s.team_members_count || 1} Team Members</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {s.website_url && (
                    <a
                      href={s.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>

                <Link
                  to={`/student/startups/${s.id}`}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <span>Venture Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Startup Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Create Startup Profile</h2>
              <p className="text-xs text-slate-400">
                Register your venture to unlock 50 Venture Coins and enable one-click challenge applications.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Startup Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. TerraPulse IoT"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Industry / Domain</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="CleanTech & IoT">CleanTech & IoT</option>
                    <option value="HealthTech & AI">HealthTech & AI</option>
                    <option value="Fintech & Web3">Fintech & Web3</option>
                    <option value="AgriTech & Food">AgriTech & Food</option>
                    <option value="EdTech & SaaS">EdTech & SaaS</option>
                    <option value="DeepTech & Robotics">DeepTech & Robotics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Tagline / One-Liner</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Autonomous energy optimization for commercial urban towers"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Development Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="IDEA">Idea Stage</option>
                    <option value="PROTOTYPE">Alpha Prototype</option>
                    <option value="MVP">Working MVP</option>
                    <option value="EARLY_TRACTION">Early Traction</option>
                    <option value="SCALING">Scaling Commercial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Problem Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.problem_statement}
                  onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                  placeholder="What critical customer pain point or commercial loss are you solving?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Proposed Solution *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.proposed_solution}
                  onChange={(e) => setFormData({ ...formData, proposed_solution: e.target.value })}
                  placeholder="How does your technology solve the problem 10x better or faster?"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Target Market & Sizing</label>
                  <input
                    type="text"
                    value={formData.target_market}
                    onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                    placeholder="Commercial real estate asset managers ($14B SAM)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Business & Revenue Model</label>
                  <input
                    type="text"
                    value={formData.business_model}
                    onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                    placeholder="Hardware lease + $450/mo SaaS subscription"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Competitors & Alternatives</label>
                  <input
                    type="text"
                    value={formData.competitors}
                    onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                    placeholder="Incumbent legacy vendors, manual inspections"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Unique Selling Proposition (USP)</label>
                  <input
                    type="text"
                    value={formData.usp}
                    onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                    placeholder="Sub-12 month payback period with non-invasive 3-hour setup"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Website or Prototype URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://myventure.io"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Pitch Deck Link / PDF</label>
                  <input
                    type="text"
                    value={formData.pitch_deck_url}
                    onChange={(e) => setFormData({ ...formData, pitch_deck_url: e.target.value })}
                    placeholder="https://drive.google.com/... or PDF link"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{creating ? 'Saving...' : 'Save & Claim 50 Coins'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
