import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Rocket,
  Scale,
  Award,
  Clock
} from 'lucide-react';

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const ReportsAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const funnelData = [
    { stage: 'Registered Ventures', count: data?.stats?.total_startups || 6 },
    { stage: 'Applications Submitted', count: data?.stats?.total_applications || 4 },
    { stage: 'Under Review', count: data?.stats?.pending_reviews || 2 },
    { stage: 'Shortlisted Finalists', count: data?.stats?.shortlisted_applications || 2 },
    { stage: 'Government Pilot Grants', count: 1 }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Innovation Analytics & Conversion Reports</h1>
          <p className="text-xs text-slate-400">
            Institutional metrics on venture maturity velocity, industry distribution, and review turnarounds.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Print Executive Brief
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Aggregating telemetry...</div>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Application Conversion</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">50.0%</div>
              <span className="text-[11px] text-slate-400 block mt-1">Submitted to Shortlist ratio</span>
            </div>
            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Average Review Turnaround</span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">2.4 Days</div>
              <span className="text-[11px] text-slate-400 block mt-1">From assignment to locked rubric</span>
            </div>
            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Average Readiness Score</span>
              <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">76.4/100</div>
              <span className="text-[11px] text-slate-400 block mt-1">AI Venture Audit index</span>
            </div>
            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Active Reviewer Load</span>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">2.1 Reviews</div>
              <span className="text-[11px] text-slate-400 block mt-1">Per active jury reviewer</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Venture Pipeline Conversion Funnel
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 50, right: 20 }}>
                    <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="stage" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Industry Distribution */}
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Sector Innovation Breakdown
              </h2>
              <div className="h-64 flex items-center justify-center">
                {data?.chart_data?.industry_distribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.chart_data.industry_distribution}
                        dataKey="count"
                        nameKey="industry"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {data.chart_data.industry_distribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">No industry telemetry recorded.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
