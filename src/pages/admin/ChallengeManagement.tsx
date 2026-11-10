import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Compass, Plus, Calendar, AlertCircle, CheckCircle2, Edit3 } from 'lucide-react';

export const ChallengeManagement: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);

  const [form, setForm] = useState({
    title: '',
    organization: '',
    category: 'CleanTech & IoT',
    problem_statement: '',
    expected_solution: '',
    eligibility: 'Open to all university students',
    prize_pool: '$25,000 Grant',
    coins_reward: 250,
    deadline: '2026-12-31',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/api/admin/challenges');
      if (res.success && Array.isArray(res.data)) {
        setChallenges(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setForm({
      title: '',
      organization: '',
      category: 'CleanTech & IoT',
      problem_statement: '',
      expected_solution: '',
      eligibility: 'Open to all university students',
      prize_pool: '$25,000 Grant',
      coins_reward: 250,
      deadline: '2026-12-31',
      status: 'ACTIVE'
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let res;
      if (editingChallenge) {
        res = await api.put(`/api/admin/challenges/${editingChallenge.id}`, form);
      } else {
        res = await api.post('/api/admin/challenges', form);
      }

      if (res.success) {
        setShowModal(false);
        fetchChallenges();
      } else {
        setError(res.error || 'Failed saving challenge.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Challenge Lifecycle Management</h1>
          <p className="text-xs text-slate-400">Author, publish, modify, and close innovation competitions across university cohorts.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-rose-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Challenge</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading competitions...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map(ch => (
            <div key={ch.id} className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-400 font-semibold">{ch.organization}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    ch.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ch.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white line-clamp-2">{ch.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{ch.problem_statement}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Applications:</span>
                  <span className="text-white font-bold">{ch.applications_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Prize Grant:</span>
                  <span className="text-emerald-400">{ch.prize_pool}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="text-amber-400">{ch.deadline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Challenge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-lg font-bold text-white">Create Challenge Brief</h2>

            {error && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Challenge Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Smart City IoT & Sustainability Challenge"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Sponsoring Organization *</label>
                  <input
                    type="text"
                    required
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="Urban Innovation Alliance"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="CleanTech & IoT">CleanTech & IoT</option>
                    <option value="HealthTech & AI">HealthTech & AI</option>
                    <option value="Fintech & Web3">Fintech & Web3</option>
                    <option value="DeepTech & Robotics">DeepTech & Robotics</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Problem Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={form.problem_statement}
                  onChange={(e) => setForm({ ...form, problem_statement: e.target.value })}
                  placeholder="Detail the industry or societal pain point..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Expected Solution Deliverables</label>
                <textarea
                  rows={2}
                  value={form.expected_solution}
                  onChange={(e) => setForm({ ...form, expected_solution: e.target.value })}
                  placeholder="Functional prototype, pitch presentation, etc."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Prize Grant Pool</label>
                  <input
                    type="text"
                    value={form.prize_pool}
                    onChange={(e) => setForm({ ...form, prize_pool: e.target.value })}
                    placeholder="$25,000 Grant"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Submission Deadline</label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  {submitting ? 'Publishing...' : 'Publish Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
