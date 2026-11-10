import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { Bell, Check, ArrowRight, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/api/student/notifications');
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/api/student/notifications/${id}/read`);
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-400" />
          <span>Alerts & Notifications</span>
        </h1>
        <p className="text-xs text-slate-400">Review evaluation decisions, pitch invitations, and challenge updates.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f172a] border border-slate-800 text-center text-xs text-slate-500">
          No notifications in your inbox.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.is_read
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-[#0f172a] border-indigo-500/40 text-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${n.is_read ? 'bg-slate-600' : 'bg-indigo-500'}`} />
                  <h3 className="text-sm font-bold text-white">{n.title}</h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-4">{n.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-4 sm:pl-0">
                {n.link_url && (
                  <Link
                    to={n.link_url}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
