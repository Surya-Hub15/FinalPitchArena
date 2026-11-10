import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './routes/ProtectedRoute.tsx';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.tsx';
import { StudentLayout } from './layouts/StudentLayout.tsx';
import { JudgeLayout } from './layouts/JudgeLayout.tsx';
import { AdminLayout } from './layouts/AdminLayout.tsx';

// Public Pages
import { HomePage } from './pages/public/HomePage.tsx';
import { ChallengesPage } from './pages/public/ChallengesPage.tsx';
import { ChallengeDetailPage } from './pages/public/ChallengeDetailPage.tsx';
import { LoginPage } from './pages/public/LoginPage.tsx';
import { RegisterPage } from './pages/public/RegisterPage.tsx';
import { FeaturesPage } from './pages/public/FeaturesPage.tsx';
import { LeaderboardPage } from './pages/public/LeaderboardPage.tsx';
import { HowItWorksPage } from './pages/public/HowItWorksPage.tsx';
import { FAQPage } from './pages/public/FAQPage.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.tsx';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage.tsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { ExploreChallenges } from './pages/student/ExploreChallenges.tsx';
import { MyStartups } from './pages/student/MyStartups.tsx';
import { StartupDetail } from './pages/student/StartupDetail.tsx';
import { MyApplications } from './pages/student/MyApplications.tsx';
import { ApplicationDetail } from './pages/student/ApplicationDetail.tsx';
import { MyTeam } from './pages/student/MyTeam.tsx';
import { AIAssistant } from './pages/student/AIAssistant.tsx';
import { PitchStudio } from './pages/student/PitchStudio.tsx';
import { StartupRoadmap } from './pages/student/StartupRoadmap.tsx';
import { Rewards } from './pages/student/Rewards.tsx';
import { StudentLeaderboard } from './pages/student/StudentLeaderboard.tsx';
import { Notifications } from './pages/student/Notifications.tsx';
import { StudentProfile } from './pages/student/StudentProfile.tsx';

// Judge Pages
import { JudgeDashboard } from './pages/judge/JudgeDashboard.tsx';
import { AssignedApplications } from './pages/judge/AssignedApplications.tsx';
import { EvaluationWorkspace } from './pages/judge/EvaluationWorkspace.tsx';
import { ShortlistedStartups } from './pages/judge/ShortlistedStartups.tsx';
import { PitchSessions } from './pages/judge/PitchSessions.tsx';
import { MyEvaluations } from './pages/judge/MyEvaluations.tsx';
import { JudgeNotifications } from './pages/judge/JudgeNotifications.tsx';
import { JudgeProfile } from './pages/judge/JudgeProfile.tsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { UserManagement } from './pages/admin/UserManagement.tsx';
import { StartupManagement } from './pages/admin/StartupManagement.tsx';
import { ChallengeManagement } from './pages/admin/ChallengeManagement.tsx';
import { ApplicationManagement } from './pages/admin/ApplicationManagement.tsx';
import { AdminApplicationDetail } from './pages/admin/AdminApplicationDetail.tsx';
import { JudgeManagement } from './pages/admin/JudgeManagement.tsx';
import { JudgeAssignments } from './pages/admin/JudgeAssignments.tsx';
import { EvaluationManagement } from './pages/admin/EvaluationManagement.tsx';
import { PitchSessionsAdmin } from './pages/admin/PitchSessionsAdmin.tsx';
import { ResultsManagement } from './pages/admin/ResultsManagement.tsx';
import { RewardsAdmin } from './pages/admin/RewardsAdmin.tsx';
import { AnnouncementsAdmin } from './pages/admin/AnnouncementsAdmin.tsx';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics.tsx';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.tsx';
import { PlatformSettings } from './pages/admin/PlatformSettings.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/challenges" element={<ExploreChallenges />} />
              <Route path="/student/startups" element={<MyStartups />} />
              <Route path="/student/startups/:id" element={<StartupDetail />} />
              <Route path="/student/applications" element={<MyApplications />} />
              <Route path="/student/applications/:id" element={<ApplicationDetail />} />
              <Route path="/student/team" element={<MyTeam />} />
              <Route path="/student/ai-assistant" element={<AIAssistant />} />
              <Route path="/student/pitch-studio" element={<PitchStudio />} />
              <Route path="/student/roadmap" element={<StartupRoadmap />} />
              <Route path="/student/rewards" element={<Rewards />} />
              <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
              <Route path="/student/notifications" element={<Notifications />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Judge Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['JUDGE']} />}>
            <Route element={<JudgeLayout />}>
              <Route path="/judge/dashboard" element={<JudgeDashboard />} />
              <Route path="/judge/applications" element={<AssignedApplications />} />
              <Route path="/judge/evaluate/:id" element={<EvaluationWorkspace />} />
              <Route path="/judge/shortlisted" element={<ShortlistedStartups />} />
              <Route path="/judge/sessions" element={<PitchSessions />} />
              <Route path="/judge/history" element={<MyEvaluations />} />
              <Route path="/judge/notifications" element={<JudgeNotifications />} />
              <Route path="/judge/profile" element={<JudgeProfile />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/startups" element={<StartupManagement />} />
              <Route path="/admin/challenges" element={<ChallengeManagement />} />
              <Route path="/admin/applications" element={<ApplicationManagement />} />
              <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
              <Route path="/admin/judges" element={<JudgeManagement />} />
              <Route path="/admin/assignments" element={<JudgeAssignments />} />
              <Route path="/admin/evaluations" element={<EvaluationManagement />} />
              <Route path="/admin/sessions" element={<PitchSessionsAdmin />} />
              <Route path="/admin/results" element={<ResultsManagement />} />
              <Route path="/admin/rewards" element={<RewardsAdmin />} />
              <Route path="/admin/announcements" element={<AnnouncementsAdmin />} />
              <Route path="/admin/reports" element={<ReportsAnalytics />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<PlatformSettings />} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
