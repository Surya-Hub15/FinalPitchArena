import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboard = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'JUDGE') return '/judge/dashboard';
    return '/admin/dashboard';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#0f172a] border border-rose-500/30 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider block">
            HTTP 403 · ACCESS FORBIDDEN
          </span>
          <h1 className="text-2xl font-bold text-white">Role Privileges Required</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your authenticated account does not have sufficient role privileges to enter this interface.
            {user && (
              <span className="block mt-2 text-slate-300">
                Current Role: <strong className="text-indigo-400">{user.role}</strong>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(getRoleDashboard())}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Return to My Dashboard
          </button>
          <Link
            to="/"
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Public Arena
          </Link>
        </div>
      </div>
    </div>
  );
};
