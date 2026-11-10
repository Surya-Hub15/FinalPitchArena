import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Invite Judge Modal
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [judgeForm, setJudgeForm] = useState({
    email: '',
    password: 'password123',
    full_name: '',
    organization: '',
    designation: 'General Partner',
    domain_expertise: 'CleanTech, Enterprise AI',
    years_experience: 10
  });
  const [creatingJudge, setCreatingJudge] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.patch(`/api/admin/users/${user.id}/status`, { status: newStatus });
      if (res.success) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingJudge(true);
    setError('');

    try {
      const res = await api.post('/api/admin/judges', {
        ...judgeForm,
        domain_expertise: judgeForm.domain_expertise.split(',').map(s => s.trim())
      });

      if (res.success) {
        setShowJudgeModal(false);
        setJudgeForm({
          email: '',
          password: 'password123',
          full_name: '',
          organization: '',
          designation: 'General Partner',
          domain_expertise: 'CleanTech, Enterprise AI',
          years_experience: 10
        });
        fetchUsers();
      } else {
        setError(res.error || 'Failed to create judge.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setCreatingJudge(false);
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
                          (u.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.profile?.organization || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform User Directory</h1>
          <p className="text-xs text-slate-400">Manage founders, reviewers, administrators, and account activation privileges.</p>
        </div>
        <button
          onClick={() => { setShowJudgeModal(true); setError(''); }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-rose-600/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Judge Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by email, name, institution, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-900 rounded-lg">
          {['ALL', 'STUDENT', 'JUDGE', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                roleFilter === role
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading users...</div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Institution / Organization</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-4 font-mono text-slate-400">#{u.id}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-sm block">
                        {u.profile?.full_name || u.email.split('@')[0]}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : u.role === 'JUDGE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {u.profile?.organization || u.profile?.college_name || 'PitchArena System'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-slate-800 hover:bg-rose-600/30 text-rose-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Judge Modal */}
      {showJudgeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f172a] border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Provision Judge Account</h3>
            <p className="text-xs text-slate-400">Create a vetted reviewer or venture capital judge profile.</p>

            {error && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateJudge} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Full Name</label>
                <input
                  type="text"
                  required
                  value={judgeForm.full_name}
                  onChange={(e) => setJudgeForm({ ...judgeForm, full_name: e.target.value })}
                  placeholder="Dr. Evelyn Harper"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Email Address</label>
                <input
                  type="email"
                  required
                  value={judgeForm.email}
                  onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                  placeholder="evelyn@venturepartners.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Initial Password</label>
                <input
                  type="text"
                  required
                  value={judgeForm.password}
                  onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Venture Firm / Org</label>
                  <input
                    type="text"
                    required
                    value={judgeForm.organization}
                    onChange={(e) => setJudgeForm({ ...judgeForm, organization: e.target.value })}
                    placeholder="Sequoia / MIT"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Designation</label>
                  <input
                    type="text"
                    value={judgeForm.designation}
                    onChange={(e) => setJudgeForm({ ...judgeForm, designation: e.target.value })}
                    placeholder="General Partner"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Domain Expertise (comma separated)</label>
                <input
                  type="text"
                  value={judgeForm.domain_expertise}
                  onChange={(e) => setJudgeForm({ ...judgeForm, domain_expertise: e.target.value })}
                  placeholder="CleanTech, HealthTech, AI"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowJudgeModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJudge}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  {creatingJudge ? 'Creating...' : 'Provision Judge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
