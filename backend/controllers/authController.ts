import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { generateAccessToken, generateRefreshToken, AuthenticatedRequest } from '../middleware/auth.ts';

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, full_name, college_name, department, academic_year } = req.body;

  if (!email || !password || !full_name) {
    res.status(400).json({ success: false, error: 'Email, password, and full name are required.' });
    return;
  }

  const existingUser = db.find('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  // CRITICAL RULE: Public registration STRICTLY assigns role = 'STUDENT'
  const newUser = db.insert('users', {
    email: email.toLowerCase(),
    password_hash: passwordHash,
    role: 'STUDENT',
    status: 'ACTIVE',
    is_email_verified: true
  });

  const studentProfile = db.insert('student_profiles', {
    user_id: newUser.id,
    full_name,
    avatar_url: '',
    phone: '',
    college_name: college_name || '',
    department: department || '',
    academic_year: academic_year || 'Undergraduate',
    bio: '',
    github_url: '',
    linkedin_url: '',
    skills: ['Ideation', 'Team Collaboration'],
    coins_balance: 50 // Welcome bonus
  });

  // Log welcome coin transaction
  db.insert('coin_transactions', {
    user_id: newUser.id,
    amount: 50,
    balance_after: 50,
    transaction_type: 'EARNED',
    reason: 'Welcome bonus upon successful registration',
    reference_type: 'SYSTEM',
    reference_id: null
  });

  // Welcome notification
  db.insert('notifications', {
    user_id: newUser.id,
    title: 'Welcome to PitchArena!',
    message: 'Your founder account has been created. Create your first startup profile to unlock 50 additional coins!',
    type: 'SUCCESS',
    link_url: '/student/startups'
  });

  // Record in audit logs
  db.insert('audit_logs', {
    actor_id: newUser.id,
    action: 'USER_REGISTERED',
    target_entity: 'users',
    target_id: newUser.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { role: 'STUDENT' }
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    accessToken,
    refreshToken,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      profile: studentProfile
    }
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  const user = db.find('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  if (user.status === 'SUSPENDED') {
    res.status(403).json({ success: false, error: 'Your account has been suspended by an administrator.' });
    return;
  }

  let profile = null;
  if (user.role === 'STUDENT') {
    profile = db.find('student_profiles', p => p.user_id === user.id);
  } else if (user.role === 'JUDGE') {
    profile = db.find('judge_profiles', p => p.user_id === user.id);
  } else if (user.role === 'ADMIN') {
    profile = { full_name: 'Platform Administrator', organization: 'PitchArena HQ' };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Record login in audit log
  db.insert('audit_logs', {
    actor_id: user.id,
    action: 'USER_LOGIN',
    target_entity: 'users',
    target_id: user.id,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.headers['user-agent'] || '',
    metadata: { role: user.role }
  });

  res.json({
    success: true,
    message: 'Authentication successful.',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile
    }
  });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated.' });
    return;
  }

  const user = db.find('users', u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  let profile = null;
  if (user.role === 'STUDENT') {
    profile = db.find('student_profiles', p => p.user_id === user.id);
  } else if (user.role === 'JUDGE') {
    profile = db.find('judge_profiles', p => p.user_id === user.id);
  } else if (user.role === 'ADMIN') {
    profile = { full_name: 'Platform Administrator', organization: 'PitchArena HQ' };
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile
    }
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required.' });
    return;
  }

  // Securely respond with generic success message even if account not found
  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been dispatched.'
  });
}
