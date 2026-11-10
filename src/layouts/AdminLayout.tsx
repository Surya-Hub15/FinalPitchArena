import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Rocket,
  Compass,
  FileCheck,
  UserCheck,
  UserPlus,
  Scale,
  Video,
  Trophy,
  Coins,
  Megaphone,
  BarChart3,
  ScrollText,
  Settings,
  LogOut,
  Flame,
  Shield,
  Menu,
  X
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navSections = [
    {
      heading: 'CORE OPERATIONS',
      items: [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Directory', path: '/admin/users', icon: Users },
        { label: 'Startup Registry', path: '/admin/startups', icon: Rocket }
      ]
    },
    {
      heading: 'COMPETITIONS & REVIEWS',
      items: [
        { label: 'Challenge Manager', path: '/admin/challenges', icon: Compass },
        { label: 'Application Pipeline', path: '/admin/applications', icon: FileCheck },
        { label: 'Judge Roster', path: '/admin/judges', icon: UserCheck },
        { label: 'Judge Assignments', path: '/admin/assignments', icon: UserPlus },
        { label: 'Scoreboard & Variance', path: '/admin/evaluations', icon: Scale },
        { label: 'Pitch Sessions', path: '/admin/sessions', icon: Video },
        { label: 'Results & Publishing', path: '/admin/results', icon: Trophy }
      ]
    },
    {
      heading: 'GOVERNANCE & SYSTEM',
      items: [
        { label: 'Coins & Rewards Rules', path: '/admin/rewards', icon: Coins },
        { label: 'Announcements Broadcast', path: '/admin/announcements', icon: Megaphone },
        { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { label: 'Security Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
        { label: 'Platform Settings', path: '/admin/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#0d121f] border-r border-slate-800 flex-col shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">PitchArena</span>
              <span className="text-[10px] text-rose-400 font-mono tracking-wider uppercase block">Director Command</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items Organized by Section */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <span className="px-3 text-[10px] font-mono tracking-wider text-slate-500 uppercase block mb-1">
                {section.heading}
              </span>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Switcher */}
        <div className="p-3 border-t border-slate-800 bg-[#090d16]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600">
                <span className="text-xs font-bold text-rose-300">AD</span>
              </div>
              <div className="truncate text-left">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  Director Command
                </span>
                <span className="text-[10px] text-rose-400 font-mono block">Super Admin</span>
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
              <span className="text-slate-500">Administrator Console</span>
              <span>/</span>
              <span className="text-slate-200 font-medium capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-full font-mono">
              Root Authority
            </span>

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
            <div className="w-64 bg-[#0d121f] h-full p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-rose-500" />
                    <span className="font-bold text-white">Admin Command</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navSections.map((sec, i) => (
                  <div key={i} className="mb-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">{sec.heading}</span>
                    <div className="space-y-1">
                      {sec.items.map(item => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                              isActive ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                            }`
                          }
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
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
