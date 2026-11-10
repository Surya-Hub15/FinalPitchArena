import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Flame, Shield, ArrowRight, UserCircle, LogOut } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'JUDGE') return '/judge/dashboard';
    return '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">

      {/* Top Bar Contract (1-line Brand wordmark, 4-5 single-line nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-cyan-300" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            PitchArena
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/challenges" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Challenges
          </Link>
          <Link to="/features" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Features & AI
          </Link>
          <Link to="/leaderboard" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Leaderboard
          </Link>
          <Link to="/how-it-works" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            How It Works
          </Link>
          <Link to="/faq" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            FAQ
          </Link>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              to={getDashboardLink()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20 whitespace-nowrap shrink-0"
            >
              <span>{user.role} Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20 whitespace-nowrap shrink-0"
              >
                Start Pitching
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Page Viewport */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090d16] text-slate-400 text-xs py-12 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Flame className="w-4 h-4 text-indigo-400" />
              <span>PitchArena</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Your Idea. Your Pitch. Your Arena. The AI-powered startup innovation and evaluation platform uniting founders, expert judges, and innovation administrators.
            </p>
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Innovation Ecosystem</h4>
            <ul className="space-y-2">
              <li><Link to="/challenges" className="hover:text-white transition">Active Challenges</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition">Ecosystem Leaderboard</Link></li>
              <li><Link to="/features" className="hover:text-white transition">AI Startup Assistant</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition">Evaluation Rubrics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Three User Roles</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-white transition">Student Founders</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Reviewers & VCs</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Program Directors</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">Competition FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Security & Integrity</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Independent multi-judge scoring, tamper-evident audit logs, and transparent evaluation criteria.
            </p>
            <div className="flex items-center gap-2 text-slate-500">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Institutional RBAC Enforced</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <span>&copy; 2026 PitchArena Platform. Built with Google AI Studio.</span>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-400">About</Link>
            <Link to="/contact" className="hover:text-slate-400">Contact</Link>
            <Link to="/faq" className="hover:text-slate-400">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
