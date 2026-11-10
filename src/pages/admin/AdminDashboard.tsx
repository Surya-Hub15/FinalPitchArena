import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import {
  Users,
  Rocket,
  Compass,
  FileCheck,
  Scale,
  Award,
  Shield,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed fetching admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading administrator command telemetry...</div>;
  }

  const stats = data?.stats || {};
  const statusData = data?.chart_data?.status_distribution || [];
  const industryData = data?.chart_data?.industry_distribution || [];
  const recentActivity = data?.recent_activity || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

  return (
    <div className="space-y-8 font-sans">
      {/* Executive Command Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-[#0f172a] border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400">EXECUTIVE COMMAND</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Institutional Platform Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Program Director Operations
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Monitor real-time application pipelines, judge evaluation velocities, and competition scoreboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/challenges"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-rose-600/30"
          >
            <Compass className="w-4 h-4" />
            <span>Create Challenge</span>
          </Link>
          <Link
            to="/admin/assignments"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 border border-slate-700"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Assign Judges</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Total Users</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">{stats.total_users || 0}</span>
          <span className="text-[10px] text-indigo-400 font-mono block">{stats.total_students || 0} Founders</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Active Judges</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{stats.total_judges || 0}</span>
          <span className="text-[10px] text-slate-500 font-mono block">Vetted reviewers</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Startups Registered</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{stats.total_startups || 0}</span>
          <span className="text-[10px] text-slate-500 font-mono block">Venture profiles</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Total Applications</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">{stats.total_applications || 0}</span>
          <span className="text-[10px] text-amber-400 font-mono block">{stats.pending_reviews || 0} Pending</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Shortlisted</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{stats.shortlisted_applications || 0}</span>
          <span className="text-[10px] text-slate-500 font-mono block">Round 2 finalists</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Active Challenges</span>
          <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{stats.active_challenges || 0}</span>
          <span className="text-[10px] text-slate-500 font-mono block">Live competitions</span>
        </div>
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Application Status Distribution (Bar Chart) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Application Pipeline by Status</h2>
            <Link to="/admin/applications" className="text-xs text-rose-400 hover:underline">
              Pipeline Table
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Sector Breakdown (Pie Chart) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Startup Sector Distribution</h2>
            <span className="text-[11px] font-mono text-slate-400">{stats.total_startups} Total</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="industry"
                >
                  {industryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Security & Activity Audit Feed */}
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Platform Security & Audit Feed</h2>
          <Link to="/admin/audit-logs" className="text-xs text-rose-400 hover:underline">
            View All Audit Logs
          </Link>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs">
          {recentActivity.map((log: any) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-rose-400 uppercase">
                  {log.action}
                </span>
                <span className="text-slate-200 font-sans">{log.actor_email}</span>
                <span className="text-slate-500 text-[11px]">→ {log.target_entity} #{log.target_id}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {new Date(log.created_at).toLocaleString()} · IP: {log.ip_address}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
