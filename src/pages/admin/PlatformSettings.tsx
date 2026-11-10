import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Lock,
  Globe
} from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    platform_name: 'PitchArena National Innovation Ecosystem',
    min_pass_score: 70,
    max_judges_per_application: 3,
    evaluation_lock_window_days: 7,
    auto_shortlist_threshold: 82,
    allow_self_registration: true,
    maintenance_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/admin/settings');
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/api/admin/settings', settings);
      if (res.success) {
        setMsg({ type: 'success', text: 'Platform security and evaluation thresholds updated successfully.' });
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to update settings.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error updating settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading platform governance config...</div>;
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Governance & Security Settings</h1>
        <p className="text-xs text-slate-400">
          Global scoring parameters, automated shortlist thresholds, and institutional access control policies.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-rose-500" />
            Ecosystem Identity & Branding
          </h2>
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Instance Platform Title</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
              className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Evaluation & Scoring Rules */}
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            Jury Rubric & Automation Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                Minimum Pass Benchmark (Points / 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.min_pass_score}
                onChange={(e) => setSettings({ ...settings, min_pass_score: parseInt(e.target.value, 10) || 70 })}
                className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Applications below this mark default to review flag.</span>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                Auto-Shortlist Score Cutoff
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.auto_shortlist_threshold}
                onChange={(e) => setSettings({ ...settings, auto_shortlist_threshold: parseInt(e.target.value, 10) || 82 })}
                className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Score target for fast-track pilot shortlisting.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                Max Reviewers Per Application
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.max_judges_per_application}
                onChange={(e) => setSettings({ ...settings, max_judges_per_application: parseInt(e.target.value, 10) || 3 })}
                className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                Evaluation Window Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.evaluation_lock_window_days}
                onChange={(e) => setSettings({ ...settings, evaluation_lock_window_days: parseInt(e.target.value, 10) || 7 })}
                className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Flags */}
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            Access Flags & Registration Controls
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_self_registration}
                onChange={(e) => setSettings({ ...settings, allow_self_registration: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 bg-[#0c1222] border-slate-800 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Allow Public Student Founder Registration</span>
                <span className="text-[11px] text-slate-400 block">Enables student signup without manual admin invitation.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 bg-[#0c1222] border-slate-800 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-white block">Maintenance Read-Only Lock</span>
                <span className="text-[11px] text-slate-400 block">Locks submission forms and evaluations during active jury deliberations.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-rose-600/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
