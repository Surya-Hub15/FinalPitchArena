import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  Rocket,
  ArrowLeft,
  Users,
  FileCheck,
  Globe,
  Sparkles,
  MapPin,
  Bot,
  Presentation,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const StartupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const res = await api.get(`/api/student/startups/${id}`);
        if (res.success && res.data) {
          setStartup(res.data);
        }
      } catch (err) {
        console.error('Failed fetching startup details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading venture profile...</div>;
  }

  if (!startup) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Startup Profile Not Found</h2>
        <Link to="/student/startups" className="text-xs text-indigo-400 hover:underline">
          Return to My Startups
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <Link to="/student/startups" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Startups</span>
      </Link>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">{startup.industry}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Stage: {startup.stage}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{startup.name}</h1>
            <p className="text-xs text-slate-400">{startup.tagline}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Readiness</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {startup.readiness_score || 50}/100
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/student/pitch-studio"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Pitch Studio</span>
              </Link>
              <Link
                to="/student/roadmap"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Roadmap</span>
              </Link>
            </div>
          </div>
        </div>

        {startup.website_url && (
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-4 text-xs text-slate-400">
            <a href={startup.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{startup.website_url}</span>
            </a>
          </div>
        )}
      </div>

      {/* Grid: Narrative Dossier & Applications/Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400">Problem Statement</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{startup.problem_statement}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400">Proposed Solution & Moat</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{startup.proposed_solution}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400">Target Market</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{startup.target_market || 'Not specified'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400">Business & Revenue Model</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{startup.business_model || startup.revenue_model || 'Not specified'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400">Competitors & Alternatives</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{startup.competitors || 'Not specified'}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400">Unique Selling Proposition</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{startup.usp || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Team Members & Associated Applications */}
        <div className="space-y-6">
          {/* Team Box */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Startup Team</h3>
              <Link to="/student/team" className="text-xs text-indigo-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {startup.team_members?.map((m: any) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{m.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{m.invitation_status}</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 block">{m.role_title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Associated Applications */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Competition Submissions</h3>

            {startup.applications?.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                <p>Not submitted to any challenges yet.</p>
                <Link to="/student/challenges" className="text-indigo-400 hover:underline mt-2 inline-block">
                  Apply to Challenge
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {startup.applications?.map((app: any) => (
                  <div key={app.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-xs font-semibold text-white block">{app.challenge_title}</span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono">
                        {app.status}
                      </span>
                      <Link to={`/student/applications/${app.id}`} className="text-slate-400 hover:text-white underline">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
