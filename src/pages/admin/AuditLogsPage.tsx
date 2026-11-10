import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  ScrollText,
  Search,
  ShieldAlert,
  Terminal,
  Clock,
  User,
  Filter
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/api/admin/audit-logs');
        if (res.success && Array.isArray(res.data)) {
          setLogs(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(log => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.actor_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.target_entity || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.ip_address || '').toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Immutable Security Audit Trail</h1>
          <p className="text-xs text-slate-400">
            Cryptographically timestamped audit logging for regulatory compliance, administrative actions, and jury locks.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit trail by actor email, action type, IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-[#0f172a] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
        >
          <option value="ALL">All Actions</option>
          <option value="USER">User Status Changes</option>
          <option value="APPLICATION">Application Status Changes</option>
          <option value="JUDGE">Judge Assignments</option>
          <option value="EVALUATION">Evaluation Unlocks</option>
          <option value="RESULTS">Official Results</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading security audit records...</div>
      ) : (
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0c1222] text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-sans">Timestamp (UTC)</th>
                <th className="py-3 px-4 font-sans">Actor Account</th>
                <th className="py-3 px-4 font-sans">Action Executed</th>
                <th className="py-3 px-4 font-sans">Target Entity</th>
                <th className="py-3 px-4 font-sans">Origin IP</th>
                <th className="py-3 px-4 font-sans">Payload Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    <span className="block font-semibold">{log.actor_email}</span>
                    <span className="text-[10px] text-slate-500">UID: #{log.actor_id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action.includes('SUSPEND') || log.action.includes('REJECT')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : log.action.includes('ASSIGN') || log.action.includes('PUBLISH')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="text-slate-400">{log.target_entity}</span>
                    {log.target_id > 0 && <span className="text-slate-500"> #{log.target_id}</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {log.ip_address}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={JSON.stringify(log.metadata)}>
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
