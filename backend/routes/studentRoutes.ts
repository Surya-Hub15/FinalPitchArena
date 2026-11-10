import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  getStudentStartups,
  createStudentStartup,
  getStudentStartupById,
  getStudentApplications,
  submitApplication,
  getStudentApplicationById,
  getStudentTeam,
  inviteTeamMember,
  getStartupRoadmap,
  toggleMilestone,
  getStudentRewards,
  getStudentNotifications,
  markNotificationRead
} from '../controllers/studentController.ts';
import { authenticateToken, authorizeRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + strict STUDENT role guard to all student routes
router.use(authenticateToken);
router.use(authorizeRole(['STUDENT']));

router.get('/dashboard', getStudentDashboard);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/startups', getStudentStartups);
router.post('/startups', createStudentStartup);
router.get('/startups/:id', getStudentStartupById);
router.get('/applications', getStudentApplications);
router.post('/applications', submitApplication);
router.get('/applications/:id', getStudentApplicationById);
router.get('/team', getStudentTeam);
router.post('/team/invite', inviteTeamMember);
router.get('/roadmap/:startupId', getStartupRoadmap);
router.put('/roadmap/:startupId/milestones/:milestoneId', toggleMilestone);
router.get('/rewards', getStudentRewards);
router.get('/notifications', getStudentNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
