import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { Bell, ArrowRight } from 'lucide-react';

export const JudgeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/api/judge/notifications');
        if (res.success && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <span>Reviewer Notifications</span>
        </h1>
        <p className="text-xs text-slate-400">Assignment notifications, committee deadlines, and live pitch schedules.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f172a] border border-slate-800 text-center text-xs text-slate-500">
          No notifications in your reviewer queue.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-white block">{n.title}</span>
                <p className="text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              {n.link_url && (
                <Link
                  to={n.link_url}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-white rounded-lg font-semibold transition shrink-0 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
