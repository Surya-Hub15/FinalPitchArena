import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  UserCheck,
  UserPlus,
  Search,
  Building,
  Briefcase,
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  Key
} from 'lucide-react';

export const JudgeManagement: React.FC = () => {
  const [judges, setJudges] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Judge Form
  const [formData, setFormData] = useState({
    email: '',
    password: 'password123',
    full_name: '',
    organization: '',
    designation: 'Venture Partner',
    domain_expertise: 'AI, DeepTech, ClimateTech',
    years_experience: 8
  });

  const fetchJudges = async () => {
    try {
      const res = await api.get('/api/admin/judges');
      if (res.success && Array.isArray(res.data)) {
        setJudges(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudges();
  }, []);

  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await api.post('/api/admin/judges', {
        ...formData,
        domain_expertise: formData.domain_expertise.split(',').map(s => s.trim())
      });
      if (res.success) {
        setMsg({ type: 'success', text: `Judge account created successfully for ${formData.email}.` });
        setModalOpen(false);
        setFormData({
          email: '',
          password: 'password123',
          full_name: '',
          organization: '',
          designation: 'Venture Partner',
          domain_expertise: 'AI, DeepTech, ClimateTech',
          years_experience: 8
        });
        fetchJudges();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to create judge.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error creating judge.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (judgeId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/api/admin/users/${judgeId}/status`, { status: nextStatus });
      if (res.success) {
        setJudges(judges.map(j => (j.id === judgeId ? { ...j, status: nextStatus } : j)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = judges.filter(j =>
    (j.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    j.email.toLowerCase().includes(search.toLowerCase()) ||
    (j.profile?.organization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Judge Roster & Reviewer Capacity</h1>
          <p className="text-xs text-slate-400">
            Maintain authorized jury members, track review queues, and provision institutional credentials.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-rose-600/30 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Provision Judge Account
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter judges by name, email, or institutional affiliation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading judge registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(judge => {
            const assigned = judge.assigned_count || 0;
            const completed = judge.completed_count || 0;
            const maxAllowed = judge.profile?.max_assignments_allowed || 10;
            const pct = Math.min(100, Math.round((assigned / maxAllowed) * 100));

            return (
              <div key={judge.id} className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-rose-400">
                        {judge.profile?.full_name?.[0] || 'J'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{judge.profile?.full_name || 'Expert Reviewer'}</h3>
                        <span className="text-[11px] text-slate-400 block">{judge.profile?.designation || 'Venture Partner'}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                      judge.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {judge.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{judge.profile?.organization || 'Independent Reviewer'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[11px]">{judge.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>{judge.profile?.years_experience || 5} Years Domain Experience</span>
                    </div>
                  </div>

                  {judge.profile?.domain_expertise && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(Array.isArray(judge.profile.domain_expertise)
                        ? judge.profile.domain_expertise
                        : [judge.profile.domain_expertise]
                      ).map((d: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800/80 text-slate-400 rounded text-[10px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Workload Capacity</span>
                      <span className="text-slate-200 font-mono tabular-nums">{assigned} / {maxAllowed} assigned</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {completed} evaluations finalized and locked
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleStatus(judge.id, judge.status)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        judge.status === 'ACTIVE'
                          ? 'text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                          : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                      }`}
                    >
                      {judge.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Account'}
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">ID #{judge.id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Judge Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Provision Judge Account</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJudge} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Elena Vance"
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="elena@ventures.com"
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Organization *</label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Sequoia Capital / IIT Incubation"
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Managing Partner / Professor"
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value, 10) || 5 })}
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Initial Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">
                  Domain Expertise (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.domain_expertise}
                  onChange={(e) => setFormData({ ...formData, domain_expertise: e.target.value })}
                  placeholder="AI, HealthTech, Clean Energy, B2B SaaS"
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
                  {submitting ? 'Creating...' : 'Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
