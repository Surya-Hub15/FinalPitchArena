import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, Building2, Briefcase, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const JudgeProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    organization: '',
    designation: '',
    years_experience: 5,
    bio: '',
    phone: '',
    expertise_input: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/judge/profile');
        if (res.success && res.data) {
          setProfile(res.data);
          setFormData({
            full_name: res.data.full_name || '',
            organization: res.data.organization || '',
            designation: res.data.designation || '',
            years_experience: res.data.years_experience || 5,
            bio: res.data.bio || '',
            phone: res.data.phone || '',
            expertise_input: Array.isArray(res.data.domain_expertise) ? res.data.domain_expertise.join(', ') : ''
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await api.put('/api/judge/profile', {
        full_name: formData.full_name,
        organization: formData.organization,
        designation: formData.designation,
        years_experience: formData.years_experience,
        bio: formData.bio,
        phone: formData.phone,
        domain_expertise: formData.expertise_input.split(',').map(s => s.trim()).filter(Boolean)
      });

      if (res.success) {
        setSuccess(true);
        refreshUser();
      } else {
        setError(res.error || 'Failed saving profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading reviewer credentials...</div>;
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Reviewer Credentials & Profile</h1>
        <p className="text-xs text-slate-400">Configure your domain expertise, firm designation, and reviewer capacity.</p>
      </div>

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Reviewer credentials updated successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-lg text-emerald-300 overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              formData.full_name[0] || 'J'
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{formData.full_name || 'Reviewer'}</h2>
            <span className="text-xs text-emerald-400 font-mono">{user?.email}</span>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Role: JUDGE / REVIEWER</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Contact Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Venture Fund / Organization</label>
            <input
              type="text"
              required
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Title / Designation</label>
            <input
              type="text"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Years of Industry Experience</label>
            <input
              type="number"
              value={formData.years_experience}
              onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value, 10) || 5 })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium block">Professional Bio & Investment History</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium block">Domain Expertise Tags (comma separated)</label>
          <input
            type="text"
            value={formData.expertise_input}
            onChange={(e) => setFormData({ ...formData, expertise_input: e.target.value })}
            placeholder="CleanTech, IoT & Edge Computing, B2B SaaS, Hardware Scaling"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-emerald-600/30"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Reviewer Credentials'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
