import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, School, Mail, Phone, Github, Linkedin, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    college_name: '',
    department: '',
    academic_year: '',
    bio: '',
    github_url: '',
    linkedin_url: '',
    skills_input: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/student/profile');
        if (res.success && res.data) {
          setProfile(res.data);
          setFormData({
            full_name: res.data.full_name || '',
            phone: res.data.phone || '',
            college_name: res.data.college_name || '',
            department: res.data.department || '',
            academic_year: res.data.academic_year || 'Senior (Year 4)',
            bio: res.data.bio || '',
            github_url: res.data.github_url || '',
            linkedin_url: res.data.linkedin_url || '',
            skills_input: Array.isArray(res.data.skills) ? res.data.skills.join(', ') : ''
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
      const res = await api.put('/api/student/profile', {
        full_name: formData.full_name,
        phone: formData.phone,
        college_name: formData.college_name,
        department: formData.department,
        academic_year: formData.academic_year,
        bio: formData.bio,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        skills: formData.skills_input.split(',').map(s => s.trim()).filter(Boolean)
      });

      if (res.success) {
        setSuccess(true);
        refreshUser();
      } else {
        setError(res.error || 'Failed saving profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading profile settings...</div>;
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Founder Profile & Settings</h1>
        <p className="text-xs text-slate-400">Manage your verified university credentials, founder bio, and technical skills.</p>
      </div>

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-indigo-500/40 flex items-center justify-center font-bold text-lg text-indigo-300 overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              formData.full_name[0] || 'U'
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{formData.full_name || 'Founder'}</h2>
            <span className="text-xs text-indigo-400 font-mono">{user?.email}</span>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Role: STUDENT / FOUNDER</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Full Legal Name</label>
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
              placeholder="+1 (555) 234-5678"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs text-slate-300 font-medium block">University / College</label>
            <input
              type="text"
              value={formData.college_name}
              onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
              placeholder="MIT / Stanford"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs text-slate-300 font-medium block">Department / Degree</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Computer Science & AI"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs text-slate-300 font-medium block">Academic Year</label>
            <input
              type="text"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="Senior (Year 4)"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium block">Founder Biography & Vision</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell competition evaluators about your background and technical mission..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">GitHub Profile</label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">LinkedIn Profile</label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium block">Founder Core Competencies (comma separated)</label>
          <input
            type="text"
            value={formData.skills_input}
            onChange={(e) => setFormData({ ...formData, skills_input: e.target.value })}
            placeholder="Embedded Systems, React, PyTorch, Chiller Architecture"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
