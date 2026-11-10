import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Users, UserPlus, Mail, School, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const MyTeam: React.FC = () => {
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role_title: 'Chief Technology Officer (Hacker)',
    college: '',
    skills: 'React, Node.js, Hardware'
  });
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [error, setError] = useState('');

  const loadTeams = async () => {
    try {
      const res = await api.get('/api/student/team');
      if (res.success && Array.isArray(res.data)) {
        setTeamsData(res.data);
        if (res.data.length > 0 && res.data[0].team) {
          setSelectedTeamId(res.data[0].team.id);
        }
      }
    } catch (err) {
      console.error('Failed loading teams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !inviteForm.name || !inviteForm.email) {
      setError('Please provide team, member name, and email.');
      return;
    }

    setInviting(true);
    setError('');

    try {
      const res = await api.post('/api/student/team/invite', {
        team_id: selectedTeamId,
        name: inviteForm.name,
        email: inviteForm.email,
        role_title: inviteForm.role_title,
        college: inviteForm.college,
        skills: inviteForm.skills.split(',').map(s => s.trim())
      });

      if (res.success) {
        setInviteSuccess(true);
        loadTeams();
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(false);
          setInviteForm({
            name: '',
            email: '',
            role_title: 'Chief Technology Officer (Hacker)',
            college: '',
            skills: 'React, Node.js, Hardware'
          });
        }, 1200);
      } else {
        setError(res.error || 'Failed to send invite.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Startup Team Roster</h1>
          <p className="text-xs text-slate-400">Manage co-founders, hackers, designers, and collegiate collaborators.</p>
        </div>
        <button
          onClick={() => { setShowInviteModal(true); setError(''); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading team rosters...</div>
      ) : teamsData.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Startup Teams Found</h3>
          <p className="text-xs text-slate-400">Register a startup first to create your founding team.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {teamsData.map(({ startup, team, members }) => (
            <div key={startup.id} className="p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-indigo-400 font-semibold">{startup.name}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{members.length} Members</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{team?.name || `${startup.name} Team`}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedTeamId(team?.id);
                    setShowInviteModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 w-fit"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member: any) => (
                  <div key={member.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-sm block">{member.name}</span>
                        <span className="text-xs text-indigo-300 font-medium block">{member.role_title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {member.invitation_status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{member.email}</span>
                      </div>
                      {member.college && (
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.college}</span>
                        </div>
                      )}
                    </div>

                    {member.skills && Array.isArray(member.skills) && member.skills.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                        {member.skills.map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="text-[10px] text-slate-400 bg-[#0b0f19] px-2 py-0.5 rounded border border-slate-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0f172a] border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">Invite Team Member</h3>
            <p className="text-xs text-slate-400">Add a co-founder, technical lead, or designer to your startup venture.</p>

            {inviteSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Team member successfully added!</span>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-3">
                {error && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">Select Team</label>
                  <select
                    value={selectedTeamId || ''}
                    onChange={(e) => setSelectedTeamId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    {teamsData.map(t => (
                      <option key={t.team?.id} value={t.team?.id}>
                        {t.startup?.name} — {t.team?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="Marcus Sterling"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="marcus@mit.edu"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">Venture Role Title</label>
                  <select
                    value={inviteForm.role_title}
                    onChange={(e) => setInviteForm({ ...inviteForm, role_title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="Chief Technology Officer (Hacker)">Chief Technology Officer (Hacker)</option>
                    <option value="Chief Product Designer (Designer)">Chief Product Designer (Designer)</option>
                    <option value="Co-Founder & Growth Lead (Hustler)">Co-Founder & Growth Lead (Hustler)</option>
                    <option value="Machine Learning Specialist">Machine Learning Specialist</option>
                    <option value="Hardware Embedded Engineer">Hardware Embedded Engineer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">College / University</label>
                  <input
                    type="text"
                    value={inviteForm.college}
                    onChange={(e) => setInviteForm({ ...inviteForm, college: e.target.value })}
                    placeholder="MIT / Stanford / IIT"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-medium">Core Skills (comma separated)</label>
                  <input
                    type="text"
                    value={inviteForm.skills}
                    onChange={(e) => setInviteForm({ ...inviteForm, skills: e.target.value })}
                    placeholder="Python, Embedded C, CAD, PyTorch"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {inviting ? 'Inviting...' : 'Add Team Member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
