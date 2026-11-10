import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Calendar,
  Award,
  Users,
  Compass,
  ArrowLeft,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<any[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await api.get(`/api/public/challenges/${id}`);
        if (res.success && res.data) {
          setChallenge(res.data);
        }
      } catch (err) {
        console.error('Error fetching challenge', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();

    // If student, load their startups for the apply dropdown
    if (user && user.role === 'STUDENT') {
      api.get('/api/student/startups').then(res => {
        if (res.success && Array.isArray(res.data)) {
          setStartups(res.data);
          if (res.data.length > 0) {
            setSelectedStartupId(res.data[0].id.toString());
          }
        }
      });
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!selectedStartupId) {
      setApplyError('Please select or create a startup first.');
      return;
    }
    setIsApplying(true);
    setApplyError('');

    try {
      const res = await api.post('/api/student/applications', {
        challenge_id: challenge.id,
        startup_id: selectedStartupId
      });

      if (res.success) {
        setApplySuccess(true);
      } else {
        setApplyError(res.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      setApplyError(err.message || 'Submission failed.');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500 text-sm">Loading challenge brief...</div>;
  }

  if (!challenge) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white">Challenge Not Found</h2>
        <Link to="/challenges" className="text-xs text-indigo-400 hover:underline">
          Return to All Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 py-12 max-w-5xl mx-auto space-y-8 font-sans">
      <Link to="/challenges" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Challenges</span>
      </Link>

      {/* Challenge Header Card */}
      <div className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block">
              {challenge.organization}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {challenge.title}
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            {challenge.category}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block">Prize Pool / Grant</span>
            <span className="text-base font-bold font-mono text-emerald-400">{challenge.prize_pool}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block">Submission Deadline</span>
            <span className="text-base font-bold font-mono text-amber-400">{challenge.deadline}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block">Maximum Team Size</span>
            <span className="text-base font-bold font-mono text-white">{challenge.max_team_size || 5} Members</span>
          </div>
        </div>
      </div>

      {/* Brief Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">Problem Statement</h2>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              {challenge.problem_statement}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">Expected Deliverables & Solution Scope</h2>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              {challenge.expected_solution || 'Working prototype demonstrating core functionality, 10-slide venture presentation deck, and empirical bench test results.'}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">Eligibility Criteria</h2>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              {challenge.eligibility || 'Open to all enrolled university students and early-stage startup founders. Teams must own full intellectual property of submitted code and hardware designs.'}
            </p>
          </section>
        </div>

        {/* Application Side Panel */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-white">Submit Application</h3>

            {applySuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Application Submitted!</span>
                </div>
                <p>Your startup has been queued for evaluation. You can track progress in your dashboard.</p>
                <Link
                  to="/student/applications"
                  className="block text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition"
                >
                  View My Applications
                </Link>
              </div>
            ) : user?.role === 'STUDENT' ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select which of your registered startups you want to submit to this innovation challenge:
                </p>

                {startups.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-amber-400">You have not registered any startups yet.</p>
                    <Link
                      to="/student/startups"
                      className="block text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Create Startup First (+50 Coins)
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs text-slate-300 block font-medium">Select Startup Profile:</label>
                    <select
                      value={selectedStartupId}
                      onChange={(e) => setSelectedStartupId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {startups.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.industry} · Stage: {s.stage})
                        </option>
                      ))}
                    </select>

                    {applyError && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{applyError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>{isApplying ? 'Submitting Application...' : 'Confirm Submission'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : user ? (
              <div className="text-xs text-slate-400 space-y-2">
                <p>You are currently authenticated as <span className="text-indigo-400 font-semibold">{user.role}</span>.</p>
                <p>Only <span className="text-white font-medium">STUDENT</span> accounts can submit startup applications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Sign in or register a free student founder account to submit your startup proposal.</p>
                <Link
                  to="/login"
                  className="block text-center py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Sign In to Apply
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
