import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export const StartupRoadmap: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<number | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Evidence modal
  const [activeMilestone, setActiveMilestone] = useState<any | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await api.get('/api/student/startups');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setStartups(res.data);
          setSelectedStartupId(res.data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const fetchRoadmap = async (sId: number) => {
    try {
      const res = await api.get(`/api/student/roadmap/${sId}`);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedStartupId) {
      fetchRoadmap(selectedStartupId);
    }
  }, [selectedStartupId]);

  const handleToggleMilestone = async (m: any) => {
    if (!selectedStartupId) return;
    setUpdating(true);
    try {
      await api.put(`/api/student/roadmap/${selectedStartupId}/milestones/${m.id}`, {
        is_completed: !m.is_completed,
        evidence_notes: m.evidence_notes
      });
      await fetchRoadmap(selectedStartupId);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartupId || !activeMilestone) return;
    setUpdating(true);
    try {
      await api.put(`/api/student/roadmap/${selectedStartupId}/milestones/${activeMilestone.id}`, {
        is_completed: true,
        evidence_notes: evidenceNotes
      });
      await fetchRoadmap(selectedStartupId);
      setActiveMilestone(null);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading roadmap...</div>;
  }

  const milestones = roadmap?.milestones || [];
  const completedCount = milestones.filter((m: any) => m.is_completed).length;
  const progressPercent = roadmap?.overall_progress || Math.round((completedCount / (milestones.length || 1)) * 100);

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">VENTURE ACCELERATOR</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">10-Stage Milestone Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <span>Startup Development Roadmap</span>
          </h1>
          <p className="text-xs text-slate-400">
            Systematically validate your venture from Problem Discovery to Government SIH Sandbox and venture funding.
          </p>
        </div>

        {/* Startup Selector */}
        {startups.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0f172a] p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-2 font-medium">Venture:</span>
            <select
              value={selectedStartupId || ''}
              onChange={(e) => setSelectedStartupId(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            >
              {startups.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Progress Overview Card */}
      <div className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              Venture Acceleration Velocity
            </span>
            <h2 className="text-xl font-bold text-white">
              {completedCount} of {milestones.length} Milestones Validated
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {progressPercent}%
            </span>
            <span className="text-xs text-slate-400">Completed</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 10-Milestone Interactive List */}
      <div className="space-y-4">
        {milestones.map((m: any, idx: number) => (
          <div
            key={m.id}
            className={`p-6 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              m.is_completed
                ? 'bg-slate-900/50 border-emerald-500/30'
                : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggleMilestone(m)}
                disabled={updating}
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition ${
                  m.is_completed
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                {m.is_completed && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                    Stage {m.stage_number}
                  </span>
                  {m.completed_at && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      Completed on {new Date(m.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className={`text-sm font-bold ${m.is_completed ? 'text-white' : 'text-slate-200'}`}>
                  {m.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {m.description}
                </p>

                {m.evidence_notes && (
                  <div className="pt-2 text-xs text-emerald-300 font-mono bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/30">
                    <span className="font-semibold block text-[10px] uppercase text-emerald-400">Verified Evidence:</span>
                    {m.evidence_notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setActiveMilestone(m);
                  setEvidenceNotes(m.evidence_notes || '');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                {m.evidence_notes ? 'Edit Evidence' : 'Attach Proof'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Attach Proof Modal */}
      {activeMilestone && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f172a] border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Attach Milestone Verification Proof</h3>
            <p className="text-xs text-slate-400">{activeMilestone.title}</p>

            <form onSubmit={handleSaveEvidence} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 block font-medium">Evidence & Metric Verification Notes:</label>
                <textarea
                  required
                  rows={4}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="e.g. Conducted 15 customer discovery interviews with building operators. Documented in Google Drive folder..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMilestone(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  {updating ? 'Saving...' : 'Verify Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
