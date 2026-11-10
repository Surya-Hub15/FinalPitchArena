import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  LayoutDashboard,
  ClipboardCheck,
  CheckCircle2,
  Video,
  History,
  Bell,
  User,
  LogOut,
  Flame,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

export const JudgeLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);

  useEffect(() => {
    const fetchJudgeData = async () => {
      try {
        const dashRes = await api.get('/api/judge/dashboard');
        if (dashRes.success && dashRes.data?.stats) {
          setPendingCount(dashRes.data.stats.pending_reviews || 0);
        }
        const notifRes = await api.get('/api/judge/notifications');
        if (notifRes.success && Array.isArray(notifRes.data)) {
          setUnreadNotifs(notifRes.data.filter((n: any) => !n.is_read).length);
        }
      } catch (e) {
        console.error('Failed fetching judge header data', e);
      }
    };
    fetchJudgeData();
  }, [location.pathname]);

  const navItems = [
    { label: 'Reviewer Dashboard', path: '/judge/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Applications', path: '/judge/applications', icon: ClipboardCheck, badge: pendingCount },
    { label: 'Shortlisted Startups', path: '/judge/shortlisted', icon: CheckCircle2 },
    { label: 'Live Pitch Sessions', path: '/judge/sessions', icon: Video },
    { label: 'My Evaluations History', path: '/judge/history', icon: History },
    { label: 'Notifications', path: '/judge/notifications', icon: Bell, badge: unreadNotifs },
    { label: 'Profile & Credentials', path: '/judge/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#0d1424] border-r border-slate-800 flex-col shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">PitchArena</span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase block">Reviewer Console</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full font-mono">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Switcher */}
        <div className="p-3 border-t border-slate-800 bg-[#090f1d]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600">
                {user?.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-emerald-300">{user?.email[0].toUpperCase()}</span>
                )}
              </div>
              <div className="truncate text-left">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {user?.profile?.full_name || 'Reviewer'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono block">Judge / VC Partner</span>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Reviewer Console</span>
              <span>/</span>
              <span className="text-slate-200 font-medium capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-full font-mono">
                {pendingCount} Pending Reviews
              </span>
            )}

            <Link
              to="/judge/notifications"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0b0f19]" />
              )}
            </Link>

            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 hidden md:block"
            >
              Public Arena
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
            <div className="w-64 bg-[#0d1424] h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-white">Reviewer Portal</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {navItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                          isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Viewport content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
