import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Video, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export const PitchSessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/api/judge/sessions');
        if (res.success && Array.isArray(res.data)) {
          setSessions(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Video className="w-6 h-6 text-cyan-400" />
          <span>Live Shark Tank Pitch Schedule</span>
        </h1>
        <p className="text-xs text-slate-400">Scheduled live investor presentations with founder Q&A.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f172a] border border-slate-800 text-center text-xs text-slate-500">
          No live sessions scheduled for your reviewer panel.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => (
            <div
              key={s.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{s.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                    {s.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(s.scheduled_at).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{s.duration_minutes} minutes</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{s.venue}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={s.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  Join Live Presentation
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
