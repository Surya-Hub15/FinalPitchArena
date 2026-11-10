import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Megaphone,
  Send,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  Bell
} from 'lucide-react';

export const AnnouncementsAdmin: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'ALL',
    challenge_id: ''
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get('/api/admin/challenges');
        if (res.success && Array.isArray(res.data)) {
          setChallenges(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchChallenges();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setBroadcasting(true);
    setMsg(null);
    try {
      const res = await api.post('/api/admin/announcements', formData);
      if (res.success) {
        setMsg({ type: 'success', text: 'Announcement successfully broadcast to all targeted platform users.' });
        setFormData({
          title: '',
          content: '',
          target_role: 'ALL',
          challenge_id: ''
        });
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to broadcast announcement.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error broadcasting announcement.' });
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Targeted Cohort Broadcast Console</h1>
        <p className="text-xs text-slate-400">
          Publish official alerts, deadline reminders, and schedule updates to student founders and jury panels.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleBroadcast} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Target Audience *</label>
              <select
                value={formData.target_role}
                onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">Entire Ecosystem (All Roles)</option>
                <option value="STUDENT">Student Founders Only</option>
                <option value="JUDGE">Jury Reviewers Only</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Associated Challenge (Optional)</label>
              <select
                value={formData.challenge_id}
                onChange={(e) => setFormData({ ...formData, challenge_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">General Platform Announcement</option>
                {challenges.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Broadcast Headline *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Smart City Sandbox: Submission Extension & Live Pitch Criteria Announced"
              className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Broadcast Content & Instructions *</label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Full announcement body detailing stage dates, rubrics, or venue links..."
              className="w-full p-3 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              Will generate in-app notification alerts for all matching accounts
            </span>

            <button
              type="submit"
              disabled={broadcasting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
