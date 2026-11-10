import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// 1. Admin Dashboard
export async function getAdminDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  const users = db.select('users');
  const students = users.filter(u => u.role === 'STUDENT');
  const judges = users.filter(u => u.role === 'JUDGE');
  const startups = db.select('startups');
  const challenges = db.select('challenges');
  const applications = db.select('applications');
  const evaluations = db.select('evaluations');

  const pendingReviews = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length;
  const shortlisted = applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;

  // Chart data: applications by status
  const statusCounts = applications.reduce((acc: any, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Chart data: industry distribution
  const industryCounts = startups.reduce((acc: any, s) => {
    acc[s.industry] = (acc[s.industry] || 0) + 1;
    return acc;
  }, {});

  const recentActivity = db.select('audit_logs').slice(-10).reverse().map(log => {
    const actor = users.find(u => u.id === log.actor_id);
    return {
      ...log,
      actor_email: actor?.email || 'System'
    };
  });

  res.json({
    success: true,
    data: {
      stats: {
        total_users: users.length,
        total_students: students.length,
        total_judges: judges.length,
        total_startups: startups.length,
        total_challenges: challenges.length,
        active_challenges: challenges.filter(c => c.status === 'ACTIVE').length,
        total_applications: applications.length,
        pending_reviews: pendingReviews,
        shortlisted_applications: shortlisted,
        rejected_applications: rejected,
        completed_evaluations: evaluations.filter(e => e.is_locked).length
      },
      chart_data: {
        status_distribution: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        industry_distribution: Object.entries(industryCounts).map(([industry, count]) => ({ industry, count }))
      },
      recent_activity: recentActivity
    }
  });
}

// 2. User Management
export async function getAdminUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const users = db.select('users').map(user => {
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = db.find('student_profiles', p => p.user_id === user.id);
    } else if (user.role === 'JUDGE') {
      profile = db.find('judge_profiles', p => p.user_id === user.id);
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      profile
    };
  });

  res.json({ success: true, data: users });
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
    return;
  }

  const user = db.find('users', u => u.id === userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  // Prevent admin self-suspension
  if (user.id === req.user!.id) {
    res.status(400).json({ success: false, error: 'Administrators cannot suspend their own account.' });
    return;
  }

  const updated = db.update('users', user.id, { status });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: `USER_${status}`,
    target_entity: 'users',
    target_id: user.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { previous_status: user.status, new_status: status }
  });

  res.json({ success: true, message: `User status updated to ${status}.`, data: updated });
}

export async function createJudgeAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { email, password, full_name, organization, designation, domain_expertise, years_experience } = req.body;

  if (!email || !password || !full_name || !organization) {
    res.status(400).json({ success: false, error: 'Email, password, full name, and organization are required.' });
    return;
  }

  const existing = db.find('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ success: false, error: 'A user with this email already exists.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.insert('users', {
    email: email.toLowerCase(),
    password_hash: passwordHash,
    role: 'JUDGE',
    status: 'ACTIVE',
    is_email_verified: true
  });

  const judgeProfile = db.insert('judge_profiles', {
    user_id: newUser.id,
    full_name,
    organization,
    designation: designation || 'Expert Reviewer',
    domain_expertise: Array.isArray(domain_expertise) ? domain_expertise : [domain_expertise || 'General Tech'],
    years_experience: parseInt(years_experience, 10) || 5,
    bio: '',
    max_assignments_allowed: 10
  });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: 'JUDGE_ACCOUNT_CREATED',
    target_entity: 'users',
    target_id: newUser.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { email, organization }
  });

  res.status(201).json({
    success: true,
    message: 'Judge account created successfully.',
    data: { user: newUser, profile: judgeProfile }
  });
}

// 3. Challenge Management
export async function getAdminChallenges(req: AuthenticatedRequest, res: Response): Promise<void> {
  const challenges = db.select('challenges').map(c => {
    const apps = db.select('applications', a => a.challenge_id === c.id);
    return {
      ...c,
      applications_count: apps.length
    };
  });
  res.json({ success: true, data: challenges });
}

export async function createChallenge(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { title, organization, category, description, problem_statement, expected_solution, eligibility, required_skills, max_team_size, prize_pool, coins_reward, deadline, start_date } = req.body;

  if (!title || !organization || !problem_statement || !deadline) {
    res.status(400).json({ success: false, error: 'Title, organization, problem statement, and deadline are required.' });
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newChallenge = db.insert('challenges', {
    created_by: req.user!.id,
    title,
    slug,
    organization,
    category: category || 'General Innovation',
    description: description || problem_statement,
    problem_statement,
    expected_solution: expected_solution || '',
    eligibility: eligibility || 'Open to all founders',
    required_skills: Array.isArray(required_skills) ? required_skills : [],
    max_team_size: parseInt(max_team_size, 10) || 5,
    prize_pool: prize_pool || '$10,000 Grant',
    coins_reward: parseInt(coins_reward, 10) || 200,
    status: 'ACTIVE',
    start_date: start_date || new Date().toISOString().split('T')[0],
    deadline
  });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: 'CHALLENGE_CREATED',
    target_entity: 'challenges',
    target_id: newChallenge.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { title }
  });

  res.status(201).json({ success: true, message: 'Challenge created.', data: newChallenge });
}

export async function updateChallenge(req: AuthenticatedRequest, res: Response): Promise<void> {
  const challengeId = parseInt(req.params.id, 10);
  const challenge = db.find('challenges', c => c.id === challengeId);
  if (!challenge) {
    res.status(404).json({ success: false, error: 'Challenge not found.' });
    return;
  }

  const updated = db.update('challenges', challenge.id, req.body);
  res.json({ success: true, message: 'Challenge updated.', data: updated });
}

// 4. Application Management
export async function getAdminApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const applications = db.select('applications').map(app => {
    const startup = db.find('startups', s => s.id === app.startup_id);
    const challenge = db.find('challenges', c => c.id === app.challenge_id);
    const applicant = db.find('users', u => u.id === app.applicant_id);
    const assignments = db.select('judge_assignments', a => a.application_id === app.id);
    const evaluations = db.select('evaluations', e => e.application_id === app.id && e.is_locked);

    const avgScore = evaluations.length > 0
      ? Math.round((evaluations.reduce((acc, e) => acc + (e.weighted_score || 0), 0) / evaluations.length) * 10) / 10
      : null;

    return {
      ...app,
      startup_name: startup?.name,
      industry: startup?.industry,
      readiness_score: startup?.readiness_score,
      challenge_title: challenge?.title,
      applicant_email: applicant?.email,
      assigned_judges_count: assignments.length,
      completed_reviews_count: evaluations.length,
      average_score: avgScore
    };
  });

  res.json({ success: true, data: applications });
}

export async function getAdminApplicationDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  const appId = parseInt(req.params.id, 10);
  const application = db.find('applications', a => a.id === appId);
  if (!application) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  const startup = db.find('startups', s => s.id === application.startup_id);
  const challenge = db.find('challenges', c => c.id === application.challenge_id);
  const applicant = db.find('users', u => u.id === application.applicant_id);
  const studentProfile = db.find('student_profiles', p => p.user_id === application.applicant_id);

  const assignments = db.select('judge_assignments', a => a.application_id === application.id).map(asg => {
    const judge = db.find('users', u => u.id === asg.judge_id);
    const judgeProfile = db.find('judge_profiles', p => p.user_id === asg.judge_id);
    const evaluation = db.find('evaluations', e => e.assignment_id === asg.id);
    return {
      ...asg,
      judge_name: judgeProfile?.full_name || judge?.email,
      judge_org: judgeProfile?.organization,
      evaluation
    };
  });

  const sessions = db.select('pitch_sessions', s => s.application_id === application.id);

  res.json({
    success: true,
    data: {
      ...application,
      startup,
      challenge,
      applicant: {
        email: applicant?.email,
        profile: studentProfile
      },
      assignments,
      pitch_sessions: sessions
    }
  });
}

export async function updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const appId = parseInt(req.params.id, 10);
  const { status, admin_notes, revision_notes } = req.body;

  const validStatuses = [
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION',
    'SHORTLISTED', 'REJECTED', 'PITCH_SCHEDULED', 'PITCH_COMPLETED',
    'PILOT', 'SELECTED', 'CLOSED'
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid application status.' });
    return;
  }

  const app = db.find('applications', a => a.id === appId);
  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  const updated = db.update('applications', app.id, {
    status,
    admin_notes: admin_notes ?? app.admin_notes,
    revision_notes: revision_notes ?? app.revision_notes,
    decision_published_at: ['SHORTLISTED', 'REJECTED', 'SELECTED'].includes(status) ? new Date().toISOString() : app.decision_published_at
  });

  // Notify student founder
  let notifType: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED' = 'INFO';
  let message = `Your application status has been updated to ${status}.`;

  if (status === 'SHORTLISTED') {
    notifType = 'SUCCESS';
    message = `Congratulations! Your startup has been officially shortlisted for the next round.`;
  } else if (status === 'NEEDS_REVISION') {
    notifType = 'ACTION_REQUIRED';
    message = `Action required: The review panel has requested revisions to your pitch deck. Notes: ${revision_notes || 'Please update details.'}`;
  } else if (status === 'REJECTED') {
    notifType = 'WARNING';
    message = `Thank you for your submission. The review panel has finalized evaluations for this cycle.`;
  }

  db.insert('notifications', {
    user_id: app.applicant_id,
    title: `Application Status: ${status}`,
    message,
    type: notifType,
    link_url: `/student/applications/${app.id}`
  });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: `APPLICATION_STATUS_${status}`,
    target_entity: 'applications',
    target_id: app.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { previous_status: app.status, new_status: status }
  });

  res.json({ success: true, message: `Application updated to ${status}.`, data: updated });
}

// 5. Judge Assignments Engine
export async function assignJudgesToApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { application_id, judge_ids, deadline } = req.body;

  if (!application_id || !Array.isArray(judge_ids) || judge_ids.length === 0) {
    res.status(400).json({ success: false, error: 'Application ID and at least one judge ID are required.' });
    return;
  }

  const appId = parseInt(application_id, 10);
  const app = db.find('applications', a => a.id === appId);
  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  const createdAssignments: any[] = [];

  judge_ids.forEach(jId => {
    const judgeId = parseInt(jId, 10);
    // Avoid duplicate assignment
    const existing = db.find('judge_assignments', a => a.application_id === appId && a.judge_id === judgeId);
    if (!existing) {
      const assignment = db.insert('judge_assignments', {
        application_id: appId,
        judge_id: judgeId,
        assigned_by: req.user!.id,
        deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'ASSIGNED',
        conflict_declared: false
      });
      createdAssignments.push(assignment);

      // Notify the judge
      db.insert('notifications', {
        user_id: judgeId,
        title: 'New Startup Evaluation Assignment',
        message: `You have been assigned to evaluate application #${appId}. Please submit your review before the deadline.`,
        type: 'ACTION_REQUIRED',
        link_url: `/judge/evaluate/${appId}`
      });
    }
  });

  // Advance application status to UNDER_REVIEW
  db.update('applications', app.id, { status: 'UNDER_REVIEW' });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: 'JUDGES_ASSIGNED',
    target_entity: 'applications',
    target_id: appId,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { assigned_judge_ids: judge_ids }
  });

  res.status(201).json({
    success: true,
    message: `Assigned ${createdAssignments.length} judges to application #${appId}.`,
    data: createdAssignments
  });
}

// 6. Evaluations Overview & Variance Detection
export async function getAdminEvaluations(req: AuthenticatedRequest, res: Response): Promise<void> {
  const evaluations = db.select('evaluations').map(ev => {
    const app = db.find('applications', a => a.id === ev.application_id);
    const startup = db.find('startups', s => s.id === app?.startup_id);
    const challenge = db.find('challenges', c => c.id === app?.challenge_id);
    const judge = db.find('users', u => u.id === ev.judge_id);
    const judgeProfile = db.find('judge_profiles', p => p.user_id === ev.judge_id);

    return {
      ...ev,
      startup_name: startup?.name,
      challenge_title: challenge?.title,
      judge_name: judgeProfile?.full_name || judge?.email,
      judge_org: judgeProfile?.organization
    };
  });

  res.json({ success: true, data: evaluations });
}

export async function unlockEvaluation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const evalId = parseInt(req.params.id, 10);
  const evaluation = db.find('evaluations', e => e.id === evalId);
  if (!evaluation) {
    res.status(404).json({ success: false, error: 'Evaluation not found.' });
    return;
  }

  const updated = db.update('evaluations', evaluation.id, { is_locked: false });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: 'EVALUATION_UNLOCKED_BY_ADMIN',
    target_entity: 'evaluations',
    target_id: evaluation.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { judge_id: evaluation.judge_id }
  });

  res.json({ success: true, message: 'Evaluation unlocked for judge revision.', data: updated });
}

// 7. Pitch Sessions Scheduler
export async function schedulePitchSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { application_id, title, scheduled_at, duration_minutes, meeting_url, venue } = req.body;

  if (!application_id || !title || !scheduled_at) {
    res.status(400).json({ success: false, error: 'Application ID, session title, and scheduled time are required.' });
    return;
  }

  const appId = parseInt(application_id, 10);
  const app = db.find('applications', a => a.id === appId);
  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  const session = db.insert('pitch_sessions', {
    application_id: appId,
    title,
    scheduled_at,
    duration_minutes: parseInt(duration_minutes, 10) || 25,
    meeting_url: meeting_url || 'https://meet.pitcharena.dev/arena-session',
    venue: venue || 'Arena Stage A',
    status: 'SCHEDULED',
    created_by: req.user!.id
  });

  db.update('applications', app.id, { status: 'PITCH_SCHEDULED' });

  // Notify student
  db.insert('notifications', {
    user_id: app.applicant_id,
    title: 'Live Pitch Session Scheduled!',
    message: `Your pitch session "${title}" has been confirmed for ${new Date(scheduled_at).toLocaleString()}.`,
    type: 'ACTION_REQUIRED',
    link_url: `/student/applications/${app.id}`
  });

  res.status(201).json({ success: true, message: 'Pitch session scheduled successfully.', data: session });
}

// 8. Results Publishing
export async function publishOfficialResults(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { results } = req.body; // Array of { application_id, status: 'SELECTED' | 'SHORTLISTED' | 'REJECTED' }

  if (!Array.isArray(results) || results.length === 0) {
    res.status(400).json({ success: false, error: 'Results payload must contain an array of decisions.' });
    return;
  }

  results.forEach(r => {
    const app = db.find('applications', a => a.id === parseInt(r.application_id, 10));
    if (app) {
      db.update('applications', app.id, {
        status: r.status,
        decision_published_at: new Date().toISOString()
      });

      db.insert('notifications', {
        user_id: app.applicant_id,
        title: 'Official Results Published',
        message: `Official challenge results have been published. Your application status is: ${r.status}.`,
        type: r.status === 'SELECTED' ? 'SUCCESS' : 'INFO',
        link_url: `/student/applications/${app.id}`
      });
    }
  });

  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: 'OFFICIAL_RESULTS_PUBLISHED',
    target_entity: 'applications',
    target_id: 0,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { decisions_count: results.length }
  });

  res.json({ success: true, message: `Successfully published results for ${results.length} applications.` });
}

// 9. Announcements Broadcast
export async function broadcastAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { title, content, target_role, challenge_id } = req.body;

  if (!title || !content) {
    res.status(400).json({ success: false, error: 'Announcement title and content are required.' });
    return;
  }

  const announcement = db.insert('announcements', {
    sender_id: req.user!.id,
    target_role: target_role || 'ALL',
    challenge_id: challenge_id ? parseInt(challenge_id, 10) : null,
    title,
    content
  });

  // Distribute as notifications to target users
  const users = db.select('users');
  users.forEach(u => {
    if (target_role === 'ALL' || u.role === target_role) {
      db.insert('notifications', {
        user_id: u.id,
        title: `Announcement: ${title}`,
        message: content.slice(0, 150) + (content.length > 150 ? '...' : ''),
        type: 'INFO',
        link_url: '/student/notifications'
      });
    }
  });

  res.status(201).json({ success: true, message: 'Announcement broadcasted.', data: announcement });
}

// 10. Audit Logs
export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const logs = db.select('audit_logs').slice(-50).reverse().map(log => {
    const actor = db.find('users', u => u.id === log.actor_id);
    return {
      ...log,
      actor_email: actor?.email || 'System'
    };
  });
  res.json({ success: true, data: logs });
}

// 11. Startups Directory
export async function getAdminStartups(req: AuthenticatedRequest, res: Response): Promise<void> {
  const startups = db.select('startups').map(s => {
    const founder = db.find('users', u => u.id === s.user_id);
    const members = db.select('team_members', m => m.startup_id === s.id);
    const applications = db.select('applications', a => a.startup_id === s.id);
    return {
      ...s,
      founder_email: founder?.email,
      members_count: members.length,
      applications_count: applications.length
    };
  });
  res.json({ success: true, data: startups });
}

// 12. Judges Directory & Workload
export async function getAdminJudges(req: AuthenticatedRequest, res: Response): Promise<void> {
  const users = db.select('users', u => u.role === 'JUDGE');
  const judges = users.map(user => {
    const profile = db.find('judge_profiles', p => p.user_id === user.id);
    const assignments = db.select('judge_assignments', a => a.judge_id === user.id);
    const completed = db.select('evaluations', e => e.judge_id === user.id && e.is_locked);
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      created_at: user.created_at,
      profile,
      assigned_count: assignments.length,
      completed_count: completed.length
    };
  });
  res.json({ success: true, data: judges });
}

// 13. Pitch Sessions List
export async function getAdminPitchSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  const sessions = db.select('pitch_sessions').map(s => {
    const app = db.find('applications', a => a.id === s.application_id);
    const startup = db.find('startups', st => st.id === app?.startup_id);
    const challenge = db.find('challenges', c => c.id === app?.challenge_id);
    return {
      ...s,
      startup_name: startup?.name,
      challenge_title: challenge?.title
    };
  });
  res.json({ success: true, data: sessions });
}

// 14. Manual Coin Grants
export async function awardStudentCoins(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { student_id, amount, reason } = req.body;
  if (!student_id || !amount) {
    res.status(400).json({ success: false, error: 'Student ID and coin amount are required.' });
    return;
  }
  const student = db.find('users', u => u.id === parseInt(student_id, 10));
  if (!student) {
    res.status(404).json({ success: false, error: 'Student not found.' });
    return;
  }
  const coinsNum = parseInt(amount, 10);
  const profile = db.find('student_profiles', p => p.user_id === student.id);
  if (profile) {
    db.update('student_profiles', profile.id, { coins: (profile.coins || 0) + coinsNum });
  }
  db.insert('coin_transactions', {
    user_id: student.id,
    amount: coinsNum,
    transaction_type: 'CREDIT',
    reason: reason || 'Admin Special Bonus Grant'
  });
  db.insert('notifications', {
    user_id: student.id,
    title: 'Bonus Innovation Coins Awarded!',
    message: `You were awarded ${coinsNum} Innovation Coins by the Arena Director: ${reason || 'Merit grant'}.`,
    type: 'SUCCESS',
    link_url: '/student/rewards'
  });
  res.json({ success: true, message: `Awarded ${coinsNum} coins successfully.` });
}

// 15. Platform Settings
let platformConfig = {
  platform_name: 'PitchArena National Innovation Ecosystem',
  min_pass_score: 70,
  max_judges_per_application: 3,
  evaluation_lock_window_days: 7,
  auto_shortlist_threshold: 82,
  allow_self_registration: true,
  maintenance_mode: false
};

export async function getPlatformSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({ success: true, data: platformConfig });
}

export async function updatePlatformSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  platformConfig = { ...platformConfig, ...req.body };
  db.insert('audit_logs', {
    actor_id: req.user!.id,
    action: 'PLATFORM_SETTINGS_UPDATED',
    target_entity: 'settings',
    target_id: 0,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: req.body
  });
  res.json({ success: true, message: 'Platform settings updated.', data: platformConfig });
}
