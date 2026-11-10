import { Router } from 'express';
import {
  getJudgeDashboard,
  getJudgeAssignedApplications,
  getApplicationForEvaluation,
  submitEvaluation,
  getJudgeShortlistedStartups,
  getJudgeSessions,
  getJudgeHistory,
  getJudgeNotifications,
  getJudgeProfile,
  updateJudgeProfile
} from '../controllers/judgeController.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + strict JUDGE role guard to all judge routes
router.use(authenticateToken);
router.use(authorizeRole(['JUDGE']));

router.get('/dashboard', getJudgeDashboard);
router.get('/applications', getJudgeAssignedApplications);
router.get('/evaluate/:applicationId', getApplicationForEvaluation);
router.post('/evaluations', submitEvaluation);
router.get('/shortlisted', getJudgeShortlistedStartups);
router.get('/sessions', getJudgeSessions);
router.get('/history', getJudgeHistory);
router.get('/notifications', getJudgeNotifications);
router.get('/profile', getJudgeProfile);
router.put('/profile', updateJudgeProfile);

export default router;
