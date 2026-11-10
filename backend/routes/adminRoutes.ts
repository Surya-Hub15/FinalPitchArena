import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  updateUserStatus,
  createJudgeAccount,
  getAdminChallenges,
  createChallenge,
  updateChallenge,
  getAdminApplications,
  getAdminApplicationDetail,
  updateApplicationStatus,
  assignJudgesToApplication,
  getAdminEvaluations,
  unlockEvaluation,
  schedulePitchSession,
  publishOfficialResults,
  broadcastAnnouncement,
  getAuditLogs,
  getAdminStartups,
  getAdminJudges,
  getAdminPitchSessions,
  awardStudentCoins,
  getPlatformSettings,
  updatePlatformSettings
} from '../controllers/adminController.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + strict ADMIN role guard to all admin routes
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/judges', getAdminJudges);
router.post('/judges', createJudgeAccount);
router.get('/startups', getAdminStartups);
router.get('/challenges', getAdminChallenges);
router.post('/challenges', createChallenge);
router.put('/challenges/:id', updateChallenge);
router.get('/applications', getAdminApplications);
router.get('/applications/:id', getAdminApplicationDetail);
router.patch('/applications/:id/status', updateApplicationStatus);
router.post('/assignments', assignJudgesToApplication);
router.get('/evaluations', getAdminEvaluations);
router.post('/evaluations/:id/unlock', unlockEvaluation);
router.get('/sessions', getAdminPitchSessions);
router.post('/sessions', schedulePitchSession);
router.post('/results/publish', publishOfficialResults);
router.post('/rewards/award', awardStudentCoins);
router.post('/announcements', broadcastAnnouncement);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

export default router;

