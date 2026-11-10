import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  Download,
  Send,
  Filter,
  Award,
  Sparkles
} from 'lucide-react';

export const ResultsManagement: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Status mapping for decisions: application_id -> 'SELECTED' | 'SHORTLISTED' | 'REJECTED'
  const [decisions, setDecisions] = useState<{ [key: number]: string }>({});

  const loadData = async () => {
    try {
      const [chalRes, appRes] = await Promise.all([
        api.get('/api/admin/challenges'),
        api.get('/api/admin/applications')
      ]);
      if (chalRes.success && Array.isArray(chalRes.data)) {
        setChallenges(chalRes.data);
        if (chalRes.data.length > 0 && !selectedChallengeId) {
          setSelectedChallengeId(chalRes.data[0].id);
        }
      }
      if (appRes.success && Array.isArray(appRes.data)) {
        setApplications(appRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const challengeApps = applications
    .filter(a => selectedChallengeId ? a.challenge_id === selectedChallengeId : true)
    .sort((a, b) => (b.average_score || 0) - (a.average_score || 0));

  // Initialize decisions from application state
  useEffect(() => {
    const map: { [key: number]: string } = {};
    challengeApps.forEach(app => {
      map[app.id] = app.status === 'SELECTED' ? 'SELECTED' :
                     app.status === 'SHORTLISTED' ? 'SHORTLISTED' :
                     app.status === 'REJECTED' ? 'REJECTED' : 'SHORTLISTED';
    });
    setDecisions(map);
  }, [selectedChallengeId, applications]);

  const handleApplyThreshold = (cutoff: number) => {
    const map: { [key: number]: string } = {};
    challengeApps.forEach(app => {
      const score = app.average_score || 0;
      if (score >= cutoff + 10) {
        map[app.id] = 'SELECTED';
      } else if (score >= cutoff) {
        map[app.id] = 'SHORTLISTED';
      } else {
        map[app.id] = 'REJECTED';
      }
    });
    setDecisions(map);
    setMsg({ type: 'success', text: `Applied cutoff rule (Cutoff: ${cutoff} pts). Review and publish below.` });
  };

  const handlePublish = async () => {
    const payload = Object.entries(decisions).map(([appId, status]) => ({
      application_id: parseInt(appId, 10),
      status
    }));

    if (payload.length === 0) return;
    setPublishing(true);
    setMsg(null);
    try {
      const res = await api.post('/api/admin/results/publish', { results: payload });
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Official decisions successfully published to founder dashboards.' });
        loadData();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to publish results.' });
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error publishing decisions.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Application ID', 'Startup Name', 'Challenge', 'Average Score', 'Decision Status'];
    const rows = challengeApps.map(app => [
      app.id,
      `"${app.startup_name}"`,
      `"${app.challenge_title}"`,
      app.average_score || 'N/A',
      decisions[app.id] || app.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pitcharena_results_challenge_${selectedChallengeId || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Results & Decision Publishing Engine</h1>
          <p className="text-xs text-slate-400">
            Audit aggregate scores, set merit cutoffs, generate podium rankings, and broadcast results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Leaderboard CSV
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || challengeApps.length === 0}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-rose-600/30 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> {publishing ? 'Publishing...' : 'Publish Official Results'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-medium border ${
          msg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Challenge Selection & Quick Cutoff Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <label className="text-xs font-mono uppercase text-slate-400 shrink-0">Select Challenge:</label>
          <select
            value={selectedChallengeId || ''}
            onChange={(e) => setSelectedChallengeId(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 bg-[#0c1222] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
          >
            {challenges.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
          <span className="text-xs font-mono uppercase text-slate-400">Quick Cutoff:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleApplyThreshold(75)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200"
            >
              75 Pts
            </button>
            <button
              onClick={() => handleApplyThreshold(80)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200"
            >
              80 Pts
            </button>
            <button
              onClick={() => handleApplyThreshold(85)}
              className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs rounded-lg border border-rose-500/30 font-semibold"
            >
              85 Pts
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Aggregating challenge scorecards...</div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                Ranked Venture Standings ({challengeApps.length})
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Sorted by Average Jury Score
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Startup Venture</th>
                <th className="py-3 px-4 text-center">Reviews Completed</th>
                <th className="py-3 px-4 text-center">Average Score</th>
                <th className="py-3 px-4">Official Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {challengeApps.map((app, idx) => {
                const decision = decisions[app.id] || app.status;
                const isTop3 = idx < 3;

                return (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 text-center">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-mono font-bold text-xs ${
                        idx === 0 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' :
                        idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40' :
                        idx === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/40' :
                        'text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block">{app.startup_name}</span>
                        {isTop3 && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{app.industry}</span>
                      <span className="text-[10px] text-slate-500 font-mono">App #{app.id}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {app.completed_reviews_count} / {app.assigned_judges_count}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-sm font-bold font-mono tabular-nums px-2.5 py-0.5 rounded border ${
                        (app.average_score || 0) >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                        (app.average_score || 0) >= 65 ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                        'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      }`}>
                        {app.average_score ? `${app.average_score}/100` : 'Pending'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={decision}
                        onChange={(e) => setDecisions({ ...decisions, [app.id]: e.target.value })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono border focus:outline-none ${
                          decision === 'SELECTED' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' :
                          decision === 'SHORTLISTED' ? 'bg-blue-950/60 border-blue-700 text-blue-300' :
                          'bg-rose-950/60 border-rose-700 text-rose-300'
                        }`}
                      >
                        <option value="SELECTED">SELECTED (WINNER)</option>
                        <option value="SHORTLISTED">SHORTLISTED (FINALIST)</option>
                        <option value="REJECTED">REJECTED (CYCLE CLOSED)</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
