import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Rocket, Search, Globe, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const StartupManagement: React.FC = () => {
  const [startups, setStartups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await api.get('/api/admin/startups');
        if (res.success && Array.isArray(res.data)) {
          setStartups(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const filtered = startups.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.industry.toLowerCase().includes(search.toLowerCase()) ||
    s.problem_statement.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Startup Registry & Verification</h1>
          <p className="text-xs text-slate-400">Audit registered startups, inspect pitch materials, and verify intellectual property claims.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search startups by name, industry, or problem statement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading startup registry...</div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1222] text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Startup ID</th>
                <th className="py-3 px-4">Startup Venture</th>
                <th className="py-3 px-4">Industry / Domain</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-center">Readiness Index</th>
                <th className="py-3 px-4 text-center">Verification</th>
                <th className="py-3 px-4 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-4 font-mono text-slate-400">#{s.id}</td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-white text-sm block">{s.name}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{s.tagline}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      {s.industry}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px]">{s.stage}</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-cyan-400 tabular-nums">
                    {s.readiness_score || 50}/100
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      VERIFIED
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.website_url && (
                        <a href={s.website_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {s.pitch_deck_url && (
                        <a href={s.pitch_deck_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
