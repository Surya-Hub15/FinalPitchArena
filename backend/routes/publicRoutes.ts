import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';

const router = Router();

// Public Challenges List
router.get('/challenges', (req: Request, res: Response) => {
  const challenges = db.select('challenges', c => c.status === 'ACTIVE' || c.status === 'UPCOMING');
  res.json({ success: true, data: challenges });
});

// Single Challenge Details
router.get('/challenges/:id', (req: Request, res: Response) => {
  const challengeId = parseInt(req.params.id, 10);
  const challenge = db.find('challenges', c => c.id === challengeId);

  if (!challenge) {
    res.status(404).json({ success: false, error: 'Challenge not found.' });
    return;
  }

  const applicationsCount = db.select('applications', a => a.challenge_id === challenge.id).length;

  res.json({
    success: true,
    data: {
      ...challenge,
      applications_count: applicationsCount
    }
  });
});

// Public Leaderboard (Top Startups and Top Founders)
router.get('/leaderboard', (req: Request, res: Response) => {
  // Top startups: calculated from readiness score and shortlisting achievements
  const startups = db.select('startups', s => s.is_verified).map(s => {
    const founderProfile = db.find('student_profiles', p => p.user_id === s.founder_id);
    const apps = db.select('applications', a => a.startup_id === s.id);
    const shortlistedCount = apps.filter(a => ['SHORTLISTED', 'SELECTED', 'PILOT'].includes(a.status)).length;
    return {
      id: s.id,
      name: s.name,
      tagline: s.tagline,
      industry: s.industry,
      stage: s.stage,
      readiness_score: s.readiness_score || 50,
      shortlisted_count: shortlistedCount,
      founder_name: founderProfile?.full_name || 'Founder',
      college_name: founderProfile?.college_name || 'Innovation Campus'
    };
  }).sort((a, b) => b.readiness_score - a.readiness_score);

  // Top founders by coins earned
  const founders = db.select('student_profiles').map(p => {
    const user = db.find('users', u => u.id === p.user_id);
    const startupsCount = db.select('startups', s => s.founder_id === p.user_id).length;
    const achievementsCount = db.select('user_achievements', ua => ua.user_id === p.user_id).length;
    return {
      user_id: p.user_id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      college_name: p.college_name,
      department: p.department,
      coins_balance: p.coins_balance || 0,
      startups_count: startupsCount,
      achievements_count: achievementsCount
    };
  }).sort((a, b) => b.coins_balance - a.coins_balance);

  res.json({
    success: true,
    data: {
      top_startups: startups.slice(0, 10),
      top_founders: founders.slice(0, 10)
    }
  });
});

// Public Ecosystem Statistics
router.get('/stats', (req: Request, res: Response) => {
  const users = db.select('users');
  const startups = db.select('startups');
  const challenges = db.select('challenges');
  const applications = db.select('applications');

  res.json({
    success: true,
    data: {
      total_founders: users.filter(u => u.role === 'STUDENT').length,
      total_judges: users.filter(u => u.role === 'JUDGE').length,
      total_startups: startups.length,
      active_challenges: challenges.filter(c => c.status === 'ACTIVE').length,
      total_applications: applications.length,
      total_prize_pool_awarded: '$125,000+',
      partner_universities: 48
    }
  });
});

export default router;
