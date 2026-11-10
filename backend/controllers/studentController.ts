import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// 1. Dashboard Stats
export async function getStudentDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const profile = db.find('student_profiles', p => p.user_id === userId);

  const startups = db.select('startups', s => s.founder_id === userId);
  const startupIds = startups.map(s => s.id);

  const applications = db.select('applications', a => a.applicant_id === userId || startupIds.includes(a.startup_id));

  const totalSubmitted = applications.length;
  const underReview = applications.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length;
  const shortlisted = applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'SELECTED' || a.status === 'PILOT').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;

  const avgReadiness = startups.length > 0
    ? Math.round(startups.reduce((acc, s) => acc + (s.readiness_score || 50), 0) / startups.length)
    : 45;

  const challenges = db.select('challenges', c => c.status === 'ACTIVE').slice(0, 3);
  const notifications = db.select('notifications', n => n.user_id === userId).slice(-5).reverse();

  // Upcoming pitch sessions
  const appIds = applications.map(a => a.id);
  const upcomingSessions = db.select('pitch_sessions', s => appIds.includes(s.application_id) && s.status === 'SCHEDULED');

  res.json({
    success: true,
    data: {
      profile,
      stats: {
        total_startups: startups.length,
        total_applications: totalSubmitted,
        under_review: underReview,
        shortlisted: shortlisted,
        rejected: rejected,
        total_coins: profile?.coins_balance || 50,
        startup_readiness_score: avgReadiness
      },
      recent_applications: applications.map(app => {
        const startup = db.find('startups', s => s.id === app.startup_id);
        const challenge = db.find('challenges', c => c.id === app.challenge_id);
        return {
          ...app,
          startup_name: startup?.name || 'Unknown Venture',
          challenge_title: challenge?.title || 'General Challenge'
        };
      }),
      recommended_challenges: challenges,
      upcoming_sessions: upcomingSessions,
      recent_notifications: notifications
    }
  });
}

// 2. Profile Management
export async function getStudentProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = db.find('users', u => u.id === userId);
  const profile = db.find('student_profiles', p => p.user_id === userId);

  res.json({
    success: true,
    data: {
      email: user?.email,
      ...profile
    }
  });
}

export async function updateStudentProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const profile = db.find('student_profiles', p => p.user_id === userId);

  if (!profile) {
    res.status(404).json({ success: false, error: 'Student profile not found.' });
    return;
  }

  const { full_name, phone, college_name, department, academic_year, bio, github_url, linkedin_url, skills, avatar_url } = req.body;

  const updated = db.update('student_profiles', profile.id, {
    full_name: full_name ?? profile.full_name,
    phone: phone ?? profile.phone,
    college_name: college_name ?? profile.college_name,
    department: department ?? profile.department,
    academic_year: academic_year ?? profile.academic_year,
    bio: bio ?? profile.bio,
    github_url: github_url ?? profile.github_url,
    linkedin_url: linkedin_url ?? profile.linkedin_url,
    skills: skills ?? profile.skills,
    avatar_url: avatar_url ?? profile.avatar_url
  });

  res.json({ success: true, message: 'Profile updated successfully.', data: updated });
}

// 3. Startups CRUD
export async function getStudentStartups(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const startups = db.select('startups', s => s.founder_id === userId);

  const enriched = startups.map(startup => {
    const apps = db.select('applications', a => a.startup_id === startup.id);
    const team = db.find('teams', t => t.startup_id === startup.id);
    const members = team ? db.select('team_members', m => m.team_id === team.id) : [];
    return {
      ...startup,
      applications_count: apps.length,
      team_members_count: members.length
    };
  });

  res.json({ success: true, data: enriched });
}

export async function createStudentStartup(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { name, tagline, industry, stage, problem_statement, proposed_solution, target_market, business_model, revenue_model, competitors, usp, website_url, pitch_deck_url } = req.body;

  if (!name || !problem_statement || !proposed_solution) {
    res.status(400).json({ success: false, error: 'Startup name, problem statement, and proposed solution are required.' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newStartup = db.insert('startups', {
    founder_id: userId,
    name,
    slug,
    logo_url: '',
    tagline: tagline || '',
    industry: industry || 'Technology',
    stage: stage || 'IDEA',
    problem_statement,
    proposed_solution,
    target_market: target_market || '',
    business_model: business_model || '',
    revenue_model: revenue_model || '',
    competitors: competitors || '',
    usp: usp || '',
    website_url: website_url || '',
    pitch_deck_url: pitch_deck_url || '',
    readiness_score: 55,
    is_verified: true
  });

  // Create associated team
  const newTeam = db.insert('teams', {
    startup_id: newStartup.id,
    name: `${name} Team`
  });

  // Add founder as team leader
  const profile = db.find('student_profiles', p => p.user_id === userId);
  db.insert('team_members', {
    team_id: newTeam.id,
    user_id: userId,
    name: profile?.full_name || 'Founder',
    email: req.user!.email,
    role_title: 'Founder & CEO (Hustler)',
    college: profile?.college_name || '',
    skills: profile?.skills || [],
    invitation_status: 'ACCEPTED'
  });

  // Initialize startup roadmap with 10 standard milestones
  const newRoadmap = db.insert('startup_roadmaps', {
    startup_id: newStartup.id,
    current_stage_index: 1,
    overall_progress: 10.00
  });

  const milestoneTitles = [
    { title: 'Problem Discovery & Customer Interviews', desc: 'Conduct at least 10 problem interviews with target users.' },
    { title: 'Market Sizing & TAM Calculation', desc: 'Calculate bottom-up addressable market.' },
    { title: 'Solution Design & Wireframing', desc: 'Map core customer user flow.' },
    { title: 'Alpha Prototype / Bench Test', desc: 'Construct working proof-of-concept.' },
    { title: 'MVP Launch & Beta Testing', desc: 'Deploy first iteration to 5 pilot users.' },
    { title: 'Pitch Deck & Financial Model', desc: 'Craft 10-slide investment narrative.' },
    { title: 'Arena Competition Pitch', desc: 'Present to expert judging panel.' },
    { title: 'Pilot Sandbox Deployment', desc: 'Deploy in government or enterprise sandbox.' },
    { title: 'First Paid Revenue Milestone', desc: 'Secure initial paying commercial client.' },
    { title: 'Seed Venture Acceleration', desc: 'Prepare for incubator or angel investment.' }
  ];

  milestoneTitles.forEach((m, idx) => {
    db.insert('roadmap_milestones', {
      roadmap_id: newRoadmap.id,
      stage_number: idx + 1,
      title: m.title,
      description: m.desc,
      is_completed: idx === 0,
      completed_at: idx === 0 ? new Date().toISOString() : null,
      evidence_notes: idx === 0 ? 'Initial problem definition finalized upon profile creation.' : null
    });
  });

  // Reward 50 coins for creating a startup
  if (profile) {
    const newBalance = (profile.coins_balance || 0) + 50;
    db.update('student_profiles', profile.id, { coins_balance: newBalance });
    db.insert('coin_transactions', {
      user_id: userId,
      amount: 50,
      balance_after: newBalance,
      transaction_type: 'EARNED',
      reason: `Created startup profile for ${name}`,
      reference_type: 'STARTUP',
      reference_id: newStartup.id
    });
  }

  // Audit log
  db.insert('audit_logs', {
    actor_id: userId,
    action: 'STARTUP_CREATED',
    target_entity: 'startups',
    target_id: newStartup.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { name, stage }
  });

  res.status(201).json({ success: true, message: 'Startup created successfully.', data: newStartup });
}

export async function getStudentStartupById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const startupId = parseInt(req.params.id, 10);

  const startup = db.find('startups', s => s.id === startupId);
  if (!startup) {
    res.status(404).json({ success: false, error: 'Startup not found.' });
    return;
  }

  // Check ownership: founder or team member
  const team = db.find('teams', t => t.startup_id === startup.id);
  const isMember = team && db.find('team_members', m => m.team_id === team.id && m.user_id === userId);

  if (startup.founder_id !== userId && !isMember) {
    res.status(403).json({ success: false, error: 'Access denied: You are not authorized to view this startup.' });
    return;
  }

  const teamMembers = team ? db.select('team_members', m => m.team_id === team.id) : [];
  const applications = db.select('applications', a => a.startup_id === startup.id).map(app => {
    const challenge = db.find('challenges', c => c.id === app.challenge_id);
    return { ...app, challenge_title: challenge?.title };
  });

  res.json({
    success: true,
    data: {
      ...startup,
      team,
      team_members: teamMembers,
      applications
    }
  });
}

// 4. Applications Submission & Viewing
export async function getStudentApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const startups = db.select('startups', s => s.founder_id === userId);
  const startupIds = startups.map(s => s.id);

  const applications = db.select('applications', a => a.applicant_id === userId || startupIds.includes(a.startup_id));

  const enriched = applications.map(app => {
    const startup = db.find('startups', s => s.id === app.startup_id);
    const challenge = db.find('challenges', c => c.id === app.challenge_id);
    return {
      ...app,
      startup_name: startup?.name || 'Venture',
      industry: startup?.industry,
      challenge_title: challenge?.title || 'Challenge',
      challenge_deadline: challenge?.deadline
    };
  });

  res.json({ success: true, data: enriched });
}

export async function submitApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { challenge_id, startup_id } = req.body;

  if (!challenge_id || !startup_id) {
    res.status(400).json({ success: false, error: 'Challenge and startup must be selected.' });
    return;
  }

  const challenge = db.find('challenges', c => c.id === parseInt(challenge_id, 10));
  if (!challenge) {
    res.status(404).json({ success: false, error: 'Challenge not found.' });
    return;
  }

  if (challenge.status !== 'ACTIVE') {
    res.status(400).json({ success: false, error: 'This challenge is no longer accepting submissions.' });
    return;
  }

  const startup = db.find('startups', s => s.id === parseInt(startup_id, 10));
  if (!startup || startup.founder_id !== userId) {
    res.status(403).json({ success: false, error: 'You do not own this startup.' });
    return;
  }

  // Check duplicate submission
  const existing = db.find('applications', a => a.challenge_id === challenge.id && a.startup_id === startup.id);
  if (existing) {
    res.status(409).json({ success: false, error: 'This startup has already been submitted to this challenge.' });
    return;
  }

  const newApp = db.insert('applications', {
    challenge_id: challenge.id,
    startup_id: startup.id,
    applicant_id: userId,
    current_round: 1,
    status: 'SUBMITTED',
    revision_notes: null,
    admin_notes: null,
    submitted_at: new Date().toISOString()
  });

  // Award 50 coins for challenge application
  const profile = db.find('student_profiles', p => p.user_id === userId);
  if (profile) {
    const newBalance = (profile.coins_balance || 0) + 50;
    db.update('student_profiles', profile.id, { coins_balance: newBalance });
    db.insert('coin_transactions', {
      user_id: userId,
      amount: 50,
      balance_after: newBalance,
      transaction_type: 'EARNED',
      reason: `Applied to ${challenge.title}`,
      reference_type: 'APPLICATION',
      reference_id: newApp.id
    });
  }

  // Create in-app notification
  db.insert('notifications', {
    user_id: userId,
    title: 'Application Received',
    message: `Your application for ${startup.name} in "${challenge.title}" has been received and queued for administrative review.`,
    type: 'INFO',
    link_url: `/student/applications/${newApp.id}`
  });

  // Audit log
  db.insert('audit_logs', {
    actor_id: userId,
    action: 'APPLICATION_SUBMITTED',
    target_entity: 'applications',
    target_id: newApp.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { challenge_title: challenge.title, startup_name: startup.name }
  });

  res.status(201).json({ success: true, message: 'Application submitted successfully.', data: newApp });
}

export async function getStudentApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const appId = parseInt(req.params.id, 10);

  const application = db.find('applications', a => a.id === appId);
  if (!application) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  const startup = db.find('startups', s => s.id === application.startup_id);
  if (application.applicant_id !== userId && startup?.founder_id !== userId) {
    res.status(403).json({ success: false, error: 'Unauthorized: You do not have permission to view this application.' });
    return;
  }

  const challenge = db.find('challenges', c => c.id === application.challenge_id);
  const team = db.find('teams', t => t.startup_id === startup?.id);
  const teamMembers = team ? db.select('team_members', m => m.team_id === team.id) : [];

  // Important security requirement:
  // Students must NEVER see confidential judge internal notes or unreleased evaluations.
  // Only show public authorized feedback when status is SHORTLISTED, SELECTED, NEEDS_REVISION, or REJECTED.
  const showFeedback = ['SHORTLISTED', 'SELECTED', 'PILOT', 'NEEDS_REVISION', 'REJECTED'].includes(application.status);
  let releasedFeedback: any[] = [];

  if (showFeedback) {
    const evaluations = db.select('evaluations', e => e.application_id === application.id && e.is_locked);
    releasedFeedback = evaluations.map((e, index) => ({
      reviewer_label: `Reviewer #${index + 1}`,
      recommendation: e.recommendation,
      strengths: e.strengths,
      weaknesses: e.weaknesses,
      suggestions: e.suggestions,
      submitted_at: e.submitted_at
      // Note: weighted_score and confidential_admin_notes are strictly excluded from student eyes!
    }));
  }

  const sessions = db.select('pitch_sessions', s => s.application_id === application.id);

  res.json({
    success: true,
    data: {
      ...application,
      startup,
      challenge,
      team_members: teamMembers,
      released_feedback: releasedFeedback,
      pitch_sessions: sessions
    }
  });
}

// 5. Team Management
export async function getStudentTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const startups = db.select('startups', s => s.founder_id === userId);

  const teamsData = startups.map(startup => {
    const team = db.find('teams', t => t.startup_id === startup.id);
    const members = team ? db.select('team_members', m => m.team_id === team.id) : [];
    return {
      startup,
      team,
      members
    };
  });

  res.json({ success: true, data: teamsData });
}

export async function inviteTeamMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { team_id, name, email, role_title, college, skills } = req.body;

  if (!team_id || !name || !email || !role_title) {
    res.status(400).json({ success: false, error: 'Team, member name, email, and role title are required.' });
    return;
  }

  const team = db.find('teams', t => t.id === parseInt(team_id, 10));
  if (!team) {
    res.status(404).json({ success: false, error: 'Team not found.' });
    return;
  }

  const startup = db.find('startups', s => s.id === team.startup_id);
  if (!startup || startup.founder_id !== userId) {
    res.status(403).json({ success: false, error: 'Only the startup founder can invite team members.' });
    return;
  }

  const newMember = db.insert('team_members', {
    team_id: team.id,
    user_id: null,
    name,
    email,
    role_title,
    college: college || '',
    skills: skills || [],
    invitation_status: 'ACCEPTED' // Mock accepted for immediate collaboration
  });

  res.status(201).json({ success: true, message: 'Team member added successfully.', data: newMember });
}

// 6. Roadmap Milestones
export async function getStartupRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
  const startupId = parseInt(req.params.startupId, 10);
  const roadmap = db.find('startup_roadmaps', r => r.startup_id === startupId);

  if (!roadmap) {
    res.status(404).json({ success: false, error: 'Roadmap not found.' });
    return;
  }

  const milestones = db.select('roadmap_milestones', m => m.roadmap_id === roadmap.id);

  res.json({
    success: true,
    data: {
      ...roadmap,
      milestones
    }
  });
}

export async function toggleMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
  const milestoneId = parseInt(req.params.milestoneId, 10);
  const milestone = db.find('roadmap_milestones', m => m.id === milestoneId);

  if (!milestone) {
    res.status(404).json({ success: false, error: 'Milestone not found.' });
    return;
  }

  const { is_completed, evidence_notes } = req.body;
  const updated = db.update('roadmap_milestones', milestone.id, {
    is_completed: is_completed ?? !milestone.is_completed,
    completed_at: is_completed ? new Date().toISOString() : null,
    evidence_notes: evidence_notes ?? milestone.evidence_notes
  });

  // Re-calculate roadmap overall progress
  const allMilestones = db.select('roadmap_milestones', m => m.roadmap_id === milestone.roadmap_id);
  const completedCount = allMilestones.filter(m => m.is_completed).length;
  const progressPercent = Math.round((completedCount / allMilestones.length) * 100);

  db.update('startup_roadmaps', milestone.roadmap_id, {
    overall_progress: progressPercent,
    current_stage_index: Math.min(10, completedCount + 1)
  });

  res.json({ success: true, message: 'Milestone updated.', data: updated });
}

// 7. Rewards & Leaderboard
export async function getStudentRewards(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const profile = db.find('student_profiles', p => p.user_id === userId);
  const transactions = db.select('coin_transactions', t => t.user_id === userId).reverse();

  const allAchievements = db.select('achievements');
  const unlocked = db.select('user_achievements', ua => ua.user_id === userId);
  const unlockedIds = unlocked.map(u => u.achievement_id);

  const achievementsWithStatus = allAchievements.map(a => ({
    ...a,
    is_unlocked: unlockedIds.includes(a.id),
    unlocked_at: unlocked.find(u => u.achievement_id === a.id)?.awarded_at || null
  }));

  res.json({
    success: true,
    data: {
      balance: profile?.coins_balance || 50,
      transactions,
      achievements: achievementsWithStatus
    }
  });
}

// 8. Notifications
export async function getStudentNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const notifications = db.select('notifications', n => n.user_id === userId).reverse();
  res.json({ success: true, data: notifications });
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  const notifId = parseInt(req.params.id, 10);
  const notif = db.find('notifications', n => n.id === notifId && n.user_id === req.user!.id);
  if (!notif) {
    res.status(404).json({ success: false, error: 'Notification not found.' });
    return;
  }
  db.update('notifications', notif.id, { is_read: true });
  res.json({ success: true, message: 'Notification marked as read.' });
}
