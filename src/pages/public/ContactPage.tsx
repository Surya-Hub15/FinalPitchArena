import React, { useState } from 'react';
import { Mail, MessageSquare, Building2, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Sponsorship', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="px-6 lg:px-12 py-12 max-w-4xl mx-auto space-y-12 font-sans">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block">PARTNERSHIPS & SUPPORT</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Contact the PitchArena Team</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Interested in sponsoring an innovation challenge, joining as a venture judge, or bringing PitchArena to your university?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">General Inquiries</h4>
            <p className="text-xs text-slate-400">support@pitcharena.dev</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Institutional Incubators</h4>
            <p className="text-xs text-slate-400">partnerships@pitcharena.dev</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h4 className="text-xs font-bold text-white">Judge Invitations</h4>
            <p className="text-xs text-slate-400">reviewers@pitcharena.dev</p>
          </div>
        </div>

        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-[#0f172a] border border-slate-800">
          {submitted ? (
            <div className="py-12 text-center space-y-3 text-emerald-400">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <h3 className="text-base font-bold text-white">Message Received</h3>
              <p className="text-xs text-slate-400">
                Thank you for contacting PitchArena. Our innovation team will respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="Sarah Lin"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="sarah@institution.org"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Inquiry Type</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Sponsorship">Sponsoring an Innovation Challenge</option>
                  <option value="Incubator Partnership">Incubator / University Partnership</option>
                  <option value="Judge Application">Applying as a Venture Reviewer / Judge</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="How can we collaborate with PitchArena?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
