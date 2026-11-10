import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// 1. Judge Dashboard
export async function getJudgeDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const profile = db.find('judge_profiles', p => p.user_id === judgeId);

  const assignments = db.select('judge_assignments', a => a.judge_id === judgeId);
  const totalAssigned = assignments.length;
  const completed = assignments.filter(a => a.status === 'COMPLETED').length;
  const pending = assignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length;

  const appIds = assignments.map(a => a.application_id);
  const pitchSessions = db.select('pitch_sessions', s => appIds.includes(s.application_id));

  // Recent evaluations by this judge
  const recentEvaluations = db.select('evaluations', e => e.judge_id === judgeId).map(ev => {
    const app = db.find('applications', a => a.id === ev.application_id);
    const startup = db.find('startups', s => s.id === app?.startup_id);
    return {
      ...ev,
      startup_name: startup?.name || 'Venture',
      industry: startup?.industry
    };
  });

  res.json({
    success: true,
    data: {
      profile,
      stats: {
        total_assigned: totalAssigned,
        completed_reviews: completed,
        pending_reviews: pending,
        upcoming_sessions_count: pitchSessions.length
      },
      upcoming_sessions: pitchSessions,
      recent_evaluations: recentEvaluations
    }
  });
}

// 2. Assigned Applications (CRITICAL SECURITY: Only return applications assigned to this judge!)
export async function getJudgeAssignedApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const assignments = db.select('judge_assignments', a => a.judge_id === judgeId);

  const applications = assignments.map(assignment => {
    const app = db.find('applications', a => a.id === assignment.application_id);
    const startup = db.find('startups', s => s.id === app?.startup_id);
    const challenge = db.find('challenges', c => c.id === app?.challenge_id);
    const evaluation = db.find('evaluations', e => e.assignment_id === assignment.id);

    return {
      assignment_id: assignment.id,
      assignment_status: assignment.status,
      assignment_deadline: assignment.deadline,
      application_id: app?.id,
      application_status: app?.status,
      submitted_at: app?.submitted_at,
      startup_id: startup?.id,
      startup_name: startup?.name,
      tagline: startup?.tagline,
      industry: startup?.industry,
      stage: startup?.stage,
      readiness_score: startup?.readiness_score,
      challenge_title: challenge?.title,
      is_evaluated: !!evaluation,
      weighted_score: evaluation?.weighted_score,
      recommendation: evaluation?.recommendation
    };
  });

  res.json({ success: true, data: applications });
}

// 3. Application Details for Evaluation Workspace (Ownership Enforced)
export async function getApplicationForEvaluation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const appId = parseInt(req.params.applicationId, 10);

  // Security Check: Judge must be assigned to this application
  const assignment = db.find('judge_assignments', a => a.judge_id === judgeId && a.application_id === appId);
  if (!assignment) {
    res.status(403).json({
      success: false,
      error: 'Access Denied: You are not assigned to evaluate this application.'
    });
    return;
  }

  const app = db.find('applications', a => a.id === appId);
  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found.' });
    return;
  }

  const startup = db.find('startups', s => s.id === app.startup_id);
  const challenge = db.find('challenges', c => c.id === app.challenge_id);
  const team = db.find('teams', t => t.startup_id === startup?.id);
  const teamMembers = team ? db.select('team_members', m => m.team_id === team.id) : [];

  // Criteria definition
  const criteria = db.select('evaluation_criteria', c => c.is_active);

  // Check if judge already evaluated
  const existingEvaluation = db.find('evaluations', e => e.assignment_id === assignment.id);
  let existingScores: any[] = [];
  if (existingEvaluation) {
    existingScores = db.select('evaluation_scores', s => s.evaluation_id === existingEvaluation.id);
  }

  res.json({
    success: true,
    data: {
      assignment,
      application: app,
      startup,
      challenge,
      team_members: teamMembers,
      criteria,
      existing_evaluation: existingEvaluation,
      existing_scores: existingScores
    }
  });
}

// 4. Submit or Save Draft Evaluation
export async function submitEvaluation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const {
    application_id,
    scores, // Array of { criteria_id, score, notes }
    recommendation, // 'SHORTLIST' | 'NEEDS_REVISION' | 'REJECT'
    strengths,
    weaknesses,
    suggestions,
    confidential_admin_notes,
    is_draft
  } = req.body;

  const appId = parseInt(application_id, 10);

  // Verify assignment ownership
  const assignment = db.find('judge_assignments', a => a.judge_id === judgeId && a.application_id === appId);
  if (!assignment) {
    res.status(403).json({ success: false, error: 'Unauthorized: You are not assigned to evaluate this application.' });
    return;
  }

  const existingEval = db.find('evaluations', e => e.assignment_id === assignment.id);
  if (existingEval && existingEval.is_locked) {
    res.status(400).json({ success: false, error: 'This evaluation has already been submitted and locked.' });
    return;
  }

  // Calculate weighted score on the backend:
  // Final Score = Sum of (Criterion Score * Weight Percent) / 10 * 10
  // e.g. Score of 9 on 20% weight = 9 * 0.20 * 10 = 18.0
  const criteriaList = db.select('evaluation_criteria', c => c.is_active);
  let totalWeightedScore = 0;

  if (Array.isArray(scores)) {
    scores.forEach(s => {
      const crit = criteriaList.find(c => c.id === parseInt(s.criteria_id, 10));
      const scoreVal = parseFloat(s.score) || 0;
      const weight = crit ? crit.weight_percent / 100 : 0.14; // Default fraction
      totalWeightedScore += (scoreVal * weight) * 10;
    });
  }

  totalWeightedScore = Math.min(100, Math.max(0, Math.round(totalWeightedScore * 100) / 100));

  let savedEval;
  if (existingEval) {
    savedEval = db.update('evaluations', existingEval.id, {
      weighted_score: totalWeightedScore,
      recommendation: recommendation || 'SHORTLIST',
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      suggestions: suggestions || '',
      confidential_admin_notes: confidential_admin_notes || '',
      is_locked: !is_draft,
      submitted_at: !is_draft ? new Date().toISOString() : null
    });
    // Remove old score entries and re-insert
    const oldScores = db.select('evaluation_scores', es => es.evaluation_id === existingEval.id);
    oldScores.forEach(os => db.delete('evaluation_scores', os.id));
  } else {
    savedEval = db.insert('evaluations', {
      assignment_id: assignment.id,
      application_id: appId,
      judge_id: judgeId,
      weighted_score: totalWeightedScore,
      recommendation: recommendation || 'SHORTLIST',
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      suggestions: suggestions || '',
      confidential_admin_notes: confidential_admin_notes || '',
      is_locked: !is_draft,
      submitted_at: !is_draft ? new Date().toISOString() : null
    });
  }

  // Insert evaluation individual criterion scores
  if (Array.isArray(scores)) {
    scores.forEach(s => {
      db.insert('evaluation_scores', {
        evaluation_id: savedEval.id,
        criteria_id: parseInt(s.criteria_id, 10),
        score: parseFloat(s.score) || 0,
        notes: s.notes || ''
      });
    });
  }

  // Update assignment status
  db.update('judge_assignments', assignment.id, {
    status: is_draft ? 'IN_PROGRESS' : 'COMPLETED'
  });

  // Log in audit trail
  db.insert('audit_logs', {
    actor_id: judgeId,
    action: is_draft ? 'EVALUATION_DRAFT_SAVED' : 'EVALUATION_SUBMITTED',
    target_entity: 'evaluations',
    target_id: savedEval.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { application_id: appId, weighted_score: totalWeightedScore, recommendation }
  });

  res.json({
    success: true,
    message: is_draft ? 'Evaluation draft saved.' : 'Evaluation submitted and locked successfully.',
    data: {
      evaluation_id: savedEval.id,
      weighted_score: totalWeightedScore,
      recommendation: savedEval.recommendation,
      is_locked: savedEval.is_locked
    }
  });
}

// 5. Shortlisted Startups (read-only permitted view)
export async function getJudgeShortlistedStartups(req: AuthenticatedRequest, res: Response): Promise<void> {
  const shortlistedApps = db.select('applications', a => a.status === 'SHORTLISTED' || a.status === 'SELECTED');

  const result = shortlistedApps.map(app => {
    const startup = db.find('startups', s => s.id === app.startup_id);
    const challenge = db.find('challenges', c => c.id === app.challenge_id);
    const evals = db.select('evaluations', e => e.application_id === app.id && e.is_locked);
    const avgScore = evals.length > 0
      ? Math.round((evals.reduce((acc, e) => acc + (e.weighted_score || 0), 0) / evals.length) * 10) / 10
      : null;

    return {
      application_id: app.id,
      startup_id: startup?.id,
      startup_name: startup?.name,
      tagline: startup?.tagline,
      industry: startup?.industry,
      challenge_title: challenge?.title,
      current_round: app.current_round,
      average_score: avgScore
    };
  });

  res.json({ success: true, data: result });
}

// 6. Pitch Sessions
export async function getJudgeSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const assignments = db.select('judge_assignments', a => a.judge_id === judgeId);
  const appIds = assignments.map(a => a.application_id);

  const sessions = db.select('pitch_sessions', s => appIds.includes(s.application_id)).map(session => {
    const app = db.find('applications', a => a.id === session.application_id);
    const startup = db.find('startups', s => s.id === app?.startup_id);
    return {
      ...session,
      startup_name: startup?.name,
      industry: startup?.industry
    };
  });

  res.json({ success: true, data: sessions });
}

// 7. My Evaluations History
export async function getJudgeHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const evaluations = db.select('evaluations', e => e.judge_id === judgeId).map(ev => {
    const app = db.find('applications', a => a.id === ev.application_id);
    const startup = db.find('startups', s => s.id === app?.startup_id);
    const challenge = db.find('challenges', c => c.id === app?.challenge_id);
    return {
      ...ev,
      startup_name: startup?.name,
      industry: startup?.industry,
      challenge_title: challenge?.title,
      application_status: app?.status
    };
  });

  res.json({ success: true, data: evaluations });
}

// 8. Notifications
export async function getJudgeNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const notifications = db.select('notifications', n => n.user_id === judgeId).reverse();
  res.json({ success: true, data: notifications });
}

// 9. Profile
export async function getJudgeProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const user = db.find('users', u => u.id === judgeId);
  const profile = db.find('judge_profiles', p => p.user_id === judgeId);

  res.json({
    success: true,
    data: {
      email: user?.email,
      ...profile
    }
  });
}

export async function updateJudgeProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const judgeId = req.user!.id;
  const profile = db.find('judge_profiles', p => p.user_id === judgeId);
  if (!profile) {
    res.status(404).json({ success: false, error: 'Judge profile not found.' });
    return;
  }

  const { full_name, organization, designation, domain_expertise, years_experience, bio, phone, avatar_url } = req.body;

  const updated = db.update('judge_profiles', profile.id, {
    full_name: full_name ?? profile.full_name,
    organization: organization ?? profile.organization,
    designation: designation ?? profile.designation,
    domain_expertise: domain_expertise ?? profile.domain_expertise,
    years_experience: years_experience ?? profile.years_experience,
    bio: bio ?? profile.bio,
    phone: phone ?? profile.phone,
    avatar_url: avatar_url ?? profile.avatar_url
  });

  res.json({ success: true, message: 'Profile updated.', data: updated });
}
