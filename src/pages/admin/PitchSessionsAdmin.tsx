import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export const PitchSessionsAdmin: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New session form
  const [formData, setFormData] = useState({
    application_id: '',
    title: '',
    scheduled_at: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
    duration_minutes: 25,
    meeting_url: 'https://meet.pitcharena.dev/arena-session',
    venue: 'Arena Main Stage (Virtual + In-Person)'
  });

  const loadData = async () => {
    try {
      const [sessRes, appRes] = await Promise.all([
        api.get('/api/admin/sessions'),
        api.get('/api/admin/applications')
      ]);
      if (sessRes.success && Array.isArray(sessRes.data)) {
        setSessions(sessRes.data);
      }
      if (appRes.success && Array.isArray(appRes.data)) {
        setApplications(appRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await api.post('/api/admin/sessions', formData);
      if (res.success) {
        setMsg({ type: 'success', text: 'Live Shark Tank pitch session confirmed and student notified.' });
        setModalOpen(false);
        loadData();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to schedule session.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error scheduling session.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Shark Tank Live Pitch Scheduler</h1>
          <p className="text-xs text-slate-400">
            Coordinate virtual and hybrid live demonstration sessions for shortlisted venture finalists.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-rose-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule Pitch Session
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading pitch sessions calendar...</div>
      ) : sessions.length === 0 ? (
        <div className="py-20 text-center bg-[#0f172a] rounded-2xl border border-slate-800 p-8 space-y-3">
          <Video className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Live Pitch Sessions Scheduled</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Schedule pitch sessions for shortlisted applicants to pitch in front of the expert investor jury.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule First Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(sess => (
            <div key={sess.id} className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Session #{sess.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {sess.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{sess.title}</h3>
                <span className="text-xs text-rose-400 font-semibold block">{sess.startup_name || 'Venture Finalist'}</span>
                <span className="text-[11px] text-slate-400 block mb-3">{sess.challenge_title}</span>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(sess.scheduled_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{sess.duration_minutes} Minutes (10 min pitch + 15 min Q&A)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{sess.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={sess.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Video className="w-3.5 h-3.5 text-rose-400" /> Launch Arena Room
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <span className="text-[10px] font-mono text-slate-500">App #{sess.application_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Pitch Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Schedule Live Pitch Session</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Target Application *</label>
                <select
                  required
                  value={formData.application_id}
                  onChange={(e) => {
                    const sel = applications.find(a => a.id === parseInt(e.target.value, 10));
                    setFormData({
                      ...formData,
                      application_id: e.target.value,
                      title: sel ? `Final Pitch Defense: ${sel.startup_name}` : formData.title
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Choose Shortlisted Application --</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      #{app.id} - {app.startup_name} ({app.challenge_title}) [{app.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Session Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Shark Tank Final Defense Round"
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value, 10) || 25 })}
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Virtual Conference URL</label>
                <input
                  type="url"
                  value={formData.meeting_url}
                  onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Venue / Physical Stage</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Auditorium Stage 1 / Hybrid Zoom"
                  className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Pitch Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
