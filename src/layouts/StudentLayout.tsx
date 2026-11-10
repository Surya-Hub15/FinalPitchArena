import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  LayoutDashboard,
  Compass,
  Rocket,
  FileText,
  Users,
  Bot,
  Presentation,
  MapPin,
  Bell,
  Coins,
  Trophy,
  User,
  LogOut,
  Flame,
  Menu,
  X
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coinsBalance, setCoinsBalance] = useState<number>(user?.profile?.coins_balance || 50);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);

  useEffect(() => {
    // Poll unread notifications and coins
    const fetchHeaderData = async () => {
      try {
        const notifRes = await api.get('/api/student/notifications');
        if (notifRes.success && Array.isArray(notifRes.data)) {
          setUnreadNotifs(notifRes.data.filter((n: any) => !n.is_read).length);
        }
        const profileRes = await api.get('/api/student/profile');
        if (profileRes.success && profileRes.data?.coins_balance !== undefined) {
          setCoinsBalance(profileRes.data.coins_balance);
        }
      } catch (e) {
        console.error('Failed fetching student header data', e);
      }
    };
    fetchHeaderData();
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Explore Challenges', path: '/student/challenges', icon: Compass },
    { label: 'My Startups', path: '/student/startups', icon: Rocket },
    { label: 'My Applications', path: '/student/applications', icon: FileText },
    { label: 'My Team', path: '/student/team', icon: Users },
    { label: 'AI Startup Assistant', path: '/student/ai-assistant', icon: Bot, highlight: true },
    { label: 'Pitch Studio', path: '/student/pitch-studio', icon: Presentation },
    { label: 'Startup Roadmap', path: '/student/roadmap', icon: MapPin },
    { label: 'Notifications', path: '/student/notifications', icon: Bell, badge: unreadNotifs },
    { label: 'Achievements & Coins', path: '/student/rewards', icon: Coins },
    { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { label: 'Profile & Settings', path: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#0f172a] border-r border-slate-800 flex-col shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Flame className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">PitchArena</span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase block">Founder Portal</span>
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
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : item.highlight
                      ? 'text-cyan-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full font-mono">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Switcher */}
        <div className="p-3 border-t border-slate-800 bg-[#0c1222]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600">
                {user?.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-indigo-300">{user?.email[0].toUpperCase()}</span>
                )}
              </div>
              <div className="truncate text-left">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {user?.profile?.full_name || user?.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">Founder (Student)</span>
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
              <span className="text-slate-500">Student Portal</span>
              <span>/</span>
              <span className="text-slate-200 font-medium capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Coins Balance */}
            <Link
              to="/student/rewards"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition"
              title="Your Venture Coins"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums">{coinsBalance}</span>
              <span className="text-[10px] text-amber-300 font-sans hidden sm:inline">Coins</span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/student/notifications"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0b0f19]" />
              )}
            </Link>

            {/* Public site link */}
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
            <div className="w-64 bg-[#0f172a] h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-white">PitchArena</span>
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
                          isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
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
