import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export interface DatabaseState {
  users: any[];
  student_profiles: any[];
  judge_profiles: any[];
  startups: any[];
  teams: any[];
  team_members: any[];
  challenges: any[];
  applications: any[];
  application_files: any[];
  judge_assignments: any[];
  evaluation_criteria: any[];
  evaluations: any[];
  evaluation_scores: any[];
  pitch_sessions: any[];
  notifications: any[];
  announcements: any[];
  coin_transactions: any[];
  achievements: any[];
  user_achievements: any[];
  startup_roadmaps: any[];
  roadmap_milestones: any[];
  ai_analyses: any[];
  pitch_documents: any[];
  audit_logs: any[];
  departments: any[];
  pilots: any[];
  pilot_milestones: any[];
  kpis: any[];
  kpi_measurements: any[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pitcharena_db.json');

// In-memory relational store with disk synchronization
class PitchArenaDatabase {
  public data: DatabaseState = {
    users: [],
    student_profiles: [],
    judge_profiles: [],
    startups: [],
    teams: [],
    team_members: [],
    challenges: [],
    applications: [],
    application_files: [],
    judge_assignments: [],
    evaluation_criteria: [],
    evaluations: [],
    evaluation_scores: [],
    pitch_sessions: [],
    notifications: [],
    announcements: [],
    coin_transactions: [],
    achievements: [],
    user_achievements: [],
    startup_roadmaps: [],
    roadmap_milestones: [],
    ai_analyses: [],
    pitch_documents: [],
    audit_logs: [],
    departments: [],
    pilots: [],
    pilot_milestones: [],
    kpis: [],
    kpi_measurements: []
  };

  private initialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.initialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        this.initialized = true;
        return;
      } catch (err) {
        console.error('Failed reading existing db file, re-seeding...', err);
      }
    }

    this.seedInitialData();
    this.persist();
    this.initialized = true;
  }

  public persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('password123', salt);

    // 1. Users
    this.data.users = [
      {
        id: 1,
        email: 'founder@pitcharena.dev',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 2,
        email: 'judge@pitcharena.dev',
        password_hash: defaultPasswordHash,
        role: 'JUDGE',
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 3,
        email: 'dr.chen@pitcharena.dev',
        password_hash: defaultPasswordHash,
        role: 'JUDGE',
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date(Date.now() - 45 * 86400000).toISOString()
      },
      {
        id: 4,
        email: 'admin@pitcharena.dev',
        password_hash: defaultPasswordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date(Date.now() - 90 * 86400000).toISOString()
      },
      {
        id: 5,
        email: 'priya.sharma@pitcharena.dev',
        password_hash: defaultPasswordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        is_email_verified: true,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString()
      }
    ];

    // 2. Student Profiles
    this.data.student_profiles = [
      {
        id: 1,
        user_id: 1,
        full_name: 'Alex Vance',
        avatar_url: '/src/assets/images/avatar_student_founder_1794284948622.jpg',
        phone: '+1 (555) 234-5678',
        college_name: 'Metropolitan Institute of Technology',
        department: 'Computer Science & AI',
        academic_year: 'Senior (Year 4)',
        bio: 'Founder building sustainable IoT grid infrastructure. Passionate about hardware-software co-design and edge AI.',
        github_url: 'https://github.com/alexvance-mit',
        linkedin_url: 'https://linkedin.com/in/alex-vance-mit',
        skills: ['Embedded Systems', 'PyTorch', 'React', 'Node.js', 'Hardware Prototyping'],
        coins_balance: 350
      },
      {
        id: 2,
        user_id: 5,
        full_name: 'Priya Sharma',
        avatar_url: '',
        phone: '+1 (555) 876-5432',
        college_name: 'National Innovation University',
        department: 'Biomedical Engineering',
        academic_year: 'Graduate (Year 1)',
        bio: 'Biomedical engineer developing non-invasive spectral glucose monitoring devices.',
        github_url: 'https://github.com/priyabiomed',
        linkedin_url: 'https://linkedin.com/in/priyasharma-bio',
        skills: ['Signal Processing', 'Sensors', 'Clinical Validation', 'Python'],
        coins_balance: 180
      }
    ];

    // 3. Judge Profiles
    this.data.judge_profiles = [
      {
        id: 1,
        user_id: 2,
        full_name: 'Elena Rostova',
        avatar_url: '/src/assets/images/avatar_judge_expert_1794284948236.jpg',
        phone: '+1 (555) 901-2345',
        organization: 'Apex Horizon Ventures',
        designation: 'General Partner & DeepTech Lead',
        domain_expertise: ['CleanTech', 'IoT & Edge Computing', 'B2B SaaS', 'Hardware Scaling'],
        years_experience: 14,
        bio: 'Former founder turned investor. Led $45M in seed and Series A rounds across industrial IoT and smart mobility.',
        max_assignments_allowed: 12
      },
      {
        id: 2,
        user_id: 3,
        full_name: 'Dr. Arthur Chen',
        avatar_url: '',
        phone: '+1 (555) 345-6789',
        organization: 'Cambridge DeepTech Institute',
        designation: 'Associate Professor & Incubator Fellow',
        domain_expertise: ['Artificial Intelligence', 'HealthTech', 'Medical Robotics', 'Algorithm Design'],
        years_experience: 18,
        bio: 'Published author in Nature Machine Intelligence. Holds 6 patents in automated biomarker detection.',
        max_assignments_allowed: 8
      }
    ];

    // 4. Evaluation Criteria (Configurable weighted 7-part rubric)
    this.data.evaluation_criteria = [
      { id: 1, name: 'Innovation & Originality', weight_percent: 20.00, description: 'Novelty of approach, IP defendability, and technological moat.' },
      { id: 2, name: 'Problem Relevance & Urgency', weight_percent: 15.00, description: 'Depth of validated customer pain point and market necessity.' },
      { id: 3, name: 'Technical Feasibility', weight_percent: 20.00, description: 'Soundness of technical architecture, prototype maturity, and engineering roadmap.' },
      { id: 4, name: 'Market Potential & TAM', weight_percent: 15.00, description: 'Total addressable market size, unit economics, and customer acquisition strategy.' },
      { id: 5, name: 'Scalability & Unit Economics', weight_percent: 15.00, description: 'Operating leverage, regional adaptability, and capital efficiency.' },
      { id: 6, name: 'Team Capability & Diversity', weight_percent: 10.00, description: 'Complementary founder skillsets, technical competency, and advisory support.' },
      { id: 7, name: 'Presentation Quality & Grit', weight_percent: 5.00, description: 'Clarity of pitch narrative, deck design, and handling of technical inquiries.' }
    ];

    // 5. Challenges
    this.data.challenges = [
      {
        id: 1,
        created_by: 4,
        title: 'Smart City Decarbonization & IoT Grid Challenge',
        slug: 'smart-city-decarbonization-iot-2026',
        organization: 'Urban Innovation Alliance',
        category: 'CleanTech & IoT',
        description: 'Design and deploy hardware-software solutions that reduce municipal commercial energy consumption and optimize building load peaks.',
        problem_statement: 'Modern metropolitan commercial buildings consume up to 42% of municipal electrical grid output during daylight peak hours, resulting in excessive carbon penalties and distribution strain.',
        expected_solution: 'Autonomous IoT telemetry units paired with edge neural predictors that dynamically modulate HVAC and chiller cycles without compromising occupant comfort.',
        eligibility: 'Open to university students and early-stage startup teams with functional prototype proof.',
        required_skills: ['IoT Architecture', 'Edge Computing', 'HVAC Protocols', 'Time-series Forecasting'],
        max_team_size: 5,
        prize_pool: '$25,000 Grant + Pilot Deployment',
        coins_reward: 250,
        status: 'ACTIVE',
        start_date: '2026-10-01',
        deadline: '2026-12-15',
        created_at: new Date(Date.now() - 40 * 86400000).toISOString()
      },
      {
        id: 2,
        created_by: 4,
        title: 'AI Clinical Diagnostic & Biomarker Screening Frontier',
        slug: 'ai-clinical-diagnostic-frontier-2026',
        organization: 'Global Health Consortium',
        category: 'HealthTech & AI',
        description: 'Harness multimodal vision and tabular health data to detect early-stage cardiopulmonary abnormalities in rural primary care centers.',
        problem_statement: 'Rural healthcare clinics lack immediate access to specialist radiologists, leading to delays of 3 to 6 weeks in diagnosing treatable pulmonary conditions.',
        expected_solution: 'Lightweight AI diagnostic triage software operating locally on low-cost tablet devices with offline inference capability.',
        eligibility: 'Student founders and academic spin-offs with validated datasets.',
        required_skills: ['Computer Vision', 'DICOM Standards', 'Embedded AI', 'Clinical Workflow'],
        max_team_size: 4,
        prize_pool: '$40,000 + Clinical Trial Sandbox',
        coins_reward: 300,
        status: 'ACTIVE',
        start_date: '2026-10-15',
        deadline: '2026-12-30',
        created_at: new Date(Date.now() - 25 * 86400000).toISOString()
      },
      {
        id: 3,
        created_by: 4,
        title: 'Fintech Inclusion & Micro-Merchant Liquidity',
        slug: 'fintech-inclusion-micro-merchant-2026',
        organization: 'Venture Capital Initiative',
        category: 'Fintech & Web3',
        description: 'Provide predictive cashflow underwriting and instant inventory micro-financing for unbanked neighborhood retail merchants.',
        problem_statement: 'Micro-merchants lack formal credit histories and collateral, forcing them to borrow from predatory lenders at 35%+ APR.',
        expected_solution: 'Alternative cash-flow credit scoring utilizing point-of-sale invoice receipts and daily SMS transaction trails.',
        eligibility: 'All registered founder teams with working MVP.',
        required_skills: ['Financial Underwriting', 'Payment APIs', 'Risk Modeling'],
        max_team_size: 5,
        prize_pool: '$20,000 Seed Investment',
        coins_reward: 200,
        status: 'ACTIVE',
        start_date: '2026-11-01',
        deadline: '2027-01-15',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];

    // 6. Startups
    this.data.startups = [
      {
        id: 1,
        founder_id: 1,
        name: 'TerraPulse IoT',
        slug: 'terrapulse-iot',
        logo_url: '',
        tagline: 'Autonomous AI-driven energy optimization for commercial urban skyscrapers.',
        industry: 'CleanTech & IoT',
        stage: 'PROTOTYPE',
        problem_statement: 'Commercial skyscrapers waste 30% of their annual HVAC energy due to static schedule-based chiller operations that ignore live occupant density and solar radiation trends.',
        proposed_solution: 'TerraPulse combines plug-and-play BACnet wireless sensor pods with an edge neural controller that modulates chiller valves in real time, cutting cooling bills by 28%.',
        target_market: 'Class A & B commercial property asset managers, corporate office campuses, and municipal headquarters ($14B SAM).',
        business_model: 'Hardware lease + $450/month per building SaaS subscription + 15% shared energy savings bonus.',
        revenue_model: 'Recurring B2B subscription tier with hardware installation fee.',
        competitors: 'Johnson Controls Metasys, Honeywell Forge, Siemens Desigo.',
        usp: 'Installs in under 3 hours without rewiring; achieves sub-12 month payback period through proprietary edge predictive control.',
        website_url: 'https://terrapulse.io',
        pitch_deck_url: '/uploads/terrapulse_deck_v3.pdf',
        readiness_score: 84,
        is_verified: true,
        created_at: new Date(Date.now() - 28 * 86400000).toISOString()
      },
      {
        id: 2,
        founder_id: 5,
        name: 'MediScan Vision',
        slug: 'mediscan-vision',
        logo_url: '',
        tagline: 'Edge AI pulmonary screening for rural community health clinics.',
        industry: 'HealthTech & AI',
        stage: 'MVP',
        problem_statement: 'Over 80% of primary health centers in semi-urban regions have X-ray machines but no radiologist on staff, causing lethal delays in diagnosing pneumonia and tuberculosis.',
        proposed_solution: 'A ruggedized 8-inch tablet application that runs quantized convolutional vision models locally, scoring chest radiographs in under 4 seconds with 96.4% sensitivity.',
        target_market: 'District health clinics, state medical procurement boards, and NGO medical relief missions ($8.5B TAM).',
        business_model: 'Annual software licensing per health center ($1,200/year) + maintenance SLA.',
        revenue_model: 'Direct B2G (Government) and B2B hospital network contracts.',
        competitors: 'Qure.ai, Lunit INSIGHT, Enlitic.',
        usp: 'Runs 100% offline without cellular data connection; optimized for sub-$150 Android hardware.',
        website_url: 'https://mediscan.health',
        pitch_deck_url: '/uploads/mediscan_seed_deck.pdf',
        readiness_score: 79,
        is_verified: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ];

    // 7. Teams
    this.data.teams = [
      { id: 1, startup_id: 1, name: 'TerraPulse Core Team' },
      { id: 2, startup_id: 2, name: 'MediScan Clinical Team' }
    ];

    // 8. Team Members
    this.data.team_members = [
      {
        id: 1,
        team_id: 1,
        user_id: 1,
        name: 'Alex Vance',
        email: 'founder@pitcharena.dev',
        role_title: 'Founder & CEO (Hustler)',
        college: 'Metropolitan Institute of Technology',
        skills: ['Embedded Systems', 'Product Strategy', 'Venture Pitching'],
        invitation_status: 'ACCEPTED'
      },
      {
        id: 2,
        team_id: 1,
        user_id: null,
        name: 'Sarah Lin',
        email: 'sarah.lin@alumni.mit.edu',
        role_title: 'Chief Technology Officer (Hacker)',
        college: 'Metropolitan Institute of Technology',
        skills: ['Edge AI', 'Rust', 'BACnet Protocols'],
        invitation_status: 'ACCEPTED'
      },
      {
        id: 3,
        team_id: 1,
        user_id: null,
        name: 'Carlos Ruiz',
        email: 'carlos.ruiz@design.edu',
        role_title: 'Lead Product Designer (Designer)',
        college: 'School of Industrial Design',
        skills: ['UI/UX', 'Hardware Enclosure CAD', 'Figma'],
        invitation_status: 'ACCEPTED'
      }
    ];

    // 9. Applications
    this.data.applications = [
      {
        id: 1,
        challenge_id: 1,
        startup_id: 1,
        applicant_id: 1,
        current_round: 2,
        status: 'SHORTLISTED',
        revision_notes: null,
        admin_notes: 'Exceptional prototype evidence. Strong hardware demonstration and verified BACnet integration tests.',
        submitted_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        decision_published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 2,
        challenge_id: 2,
        startup_id: 2,
        applicant_id: 5,
        current_round: 1,
        status: 'UNDER_REVIEW',
        revision_notes: null,
        admin_notes: 'Under review by Dr. Chen and Elena Rostova. Awaiting clinical validation verification.',
        submitted_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        decision_published_at: null,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString()
      }
    ];

    // 10. Judge Assignments
    this.data.judge_assignments = [
      {
        id: 1,
        application_id: 1,
        judge_id: 2, // Elena Rostova
        assigned_by: 4,
        deadline: '2026-11-20',
        status: 'COMPLETED',
        conflict_declared: false,
        created_at: new Date(Date.now() - 18 * 86400000).toISOString()
      },
      {
        id: 2,
        application_id: 1,
        judge_id: 3, // Dr. Arthur Chen
        assigned_by: 4,
        deadline: '2026-11-20',
        status: 'COMPLETED',
        conflict_declared: false,
        created_at: new Date(Date.now() - 18 * 86400000).toISOString()
      },
      {
        id: 3,
        application_id: 2,
        judge_id: 2,
        assigned_by: 4,
        deadline: '2026-11-25',
        status: 'ASSIGNED',
        conflict_declared: false,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 4,
        application_id: 2,
        judge_id: 3,
        assigned_by: 4,
        deadline: '2026-11-25',
        status: 'IN_PROGRESS',
        conflict_declared: false,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ];

    // 11. Evaluations
    this.data.evaluations = [
      {
        id: 1,
        assignment_id: 1,
        application_id: 1,
        judge_id: 2,
        weighted_score: 88.50,
        recommendation: 'SHORTLIST',
        strengths: 'Outstanding technical demo. The sub-12 month payback period addresses the primary friction in commercial facility adoption. Well-balanced hacker/hustler team.',
        weaknesses: 'Long municipal procurement cycles could challenge cash runway. Needs clearer distributor channel partnerships.',
        suggestions: 'Target private corporate real estate managers first before engaging city municipal buildings to accelerate sales velocity.',
        confidential_admin_notes: 'Top tier candidate for pilot grant funding. Recommended for Demo Day presentation.',
        is_locked: true,
        submitted_at: new Date(Date.now() - 12 * 86400000).toISOString()
      },
      {
        id: 2,
        assignment_id: 2,
        application_id: 1,
        judge_id: 3,
        weighted_score: 86.00,
        recommendation: 'SHORTLIST',
        strengths: 'Rigorous algorithmic architecture. The predictive edge neural controller demonstrates genuine innovation over standard PID loops.',
        weaknesses: 'Requires field verification in harsh ambient temperature variations above 45°C.',
        suggestions: 'Implement automated failsafe fallback to standard BACnet thermostats in case of hardware brownouts.',
        confidential_admin_notes: 'Strong alignment with smart city category criteria.',
        is_locked: true,
        submitted_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];

    // 12. Evaluation Scores (7 Criteria per evaluation)
    // For Evaluation 1 (Elena Rostova on TerraPulse):
    this.data.evaluation_scores = [
      { id: 1, evaluation_id: 1, criteria_id: 1, score: 9.0, notes: 'Proprietary edge predictive control model.' },
      { id: 2, evaluation_id: 1, criteria_id: 2, score: 9.5, notes: 'Urgent commercial carbon penalty driver.' },
      { id: 3, evaluation_id: 1, criteria_id: 3, score: 8.5, notes: 'Proven bench test with BACnet simulator.' },
      { id: 4, evaluation_id: 1, criteria_id: 4, score: 8.5, notes: 'High value commercial real estate segment.' },
      { id: 5, evaluation_id: 1, criteria_id: 5, score: 8.5, notes: 'Low bill-of-materials and high SaaS margin.' },
      { id: 6, evaluation_id: 1, criteria_id: 6, score: 9.0, notes: 'Complementary engineering and venture background.' },
      { id: 7, evaluation_id: 1, criteria_id: 7, score: 9.5, notes: 'Crisp deck structure and professional executive summary.' },
      // For Evaluation 2 (Dr. Arthur Chen on TerraPulse):
      { id: 8, evaluation_id: 2, criteria_id: 1, score: 8.5, notes: 'Solid reinforcement learning approach.' },
      { id: 9, evaluation_id: 2, criteria_id: 2, score: 9.0, notes: 'Direct alignment with climate targets.' },
      { id: 10, evaluation_id: 2, criteria_id: 3, score: 9.0, notes: 'Robust embedded architecture.' },
      { id: 11, evaluation_id: 2, criteria_id: 4, score: 8.0, notes: 'Competitive incumbent presence to navigate.' },
      { id: 12, evaluation_id: 2, criteria_id: 5, score: 8.5, notes: 'Scalable firmware updates over air.' },
      { id: 13, evaluation_id: 2, criteria_id: 6, score: 8.5, notes: 'Dedicated founders with technical depth.' },
      { id: 14, evaluation_id: 2, criteria_id: 7, score: 9.0, notes: 'Clear data charts and validation metrics.' }
    ];

    // 13. Pitch Sessions
    this.data.pitch_sessions = [
      {
        id: 1,
        application_id: 1,
        title: 'TerraPulse IoT Live Shark Tank Pitch & Q&A',
        scheduled_at: new Date(Date.now() + 3 * 86400000).toISOString(),
        duration_minutes: 25,
        meeting_url: 'https://meet.pitcharena.dev/session/tp-sharktank-2026',
        venue: 'Main Innovation Arena & Virtual Stream',
        status: 'SCHEDULED',
        created_by: 4
      }
    ];

    // 14. Notifications
    this.data.notifications = [
      {
        id: 1,
        user_id: 1,
        title: 'Congratulations! Application Shortlisted',
        message: 'TerraPulse IoT has been officially shortlisted for Round 2 of the Smart City Decarbonization Challenge.',
        type: 'SUCCESS',
        link_url: '/student/applications/1',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 2,
        user_id: 1,
        title: 'Pitch Session Scheduled',
        message: 'Your live pitch session has been scheduled with the judging panel for Nov 13 at 2:00 PM EST.',
        type: 'ACTION_REQUIRED',
        link_url: '/student/applications/1',
        is_read: false,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 3,
        user_id: 2,
        title: 'New Evaluation Assignment',
        message: 'You have been assigned to evaluate MediScan Vision for the AI Clinical Diagnostic Challenge.',
        type: 'INFO',
        link_url: '/judge/applications/2',
        is_read: false,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ];

    // 15. Announcements
    this.data.announcements = [
      {
        id: 1,
        sender_id: 4,
        target_role: 'ALL',
        challenge_id: null,
        title: 'PitchArena Winter 2026 Finals Announcement',
        content: 'Final pitch sessions will be broadcast live from the University Innovation Arena. All finalists will receive 1-on-1 VC mentorship slots.',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 2,
        sender_id: 4,
        target_role: 'STUDENT',
        challenge_id: 1,
        title: 'Office Hours: Hardware Testing Protocol',
        content: 'Join our technical advisors this Thursday at 4 PM for advice on testing BACnet sensors and electrical compliance.',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];

    // 16. Achievements Catalog
    this.data.achievements = [
      { id: 1, title: 'Genesis Pitch', description: 'Created and registered your first verified startup profile', badge_icon: 'Sparkles', coins_reward: 50, trigger_event: 'FIRST_STARTUP' },
      { id: 2, title: 'Arena Contender', description: 'Officially applied to your first competitive innovation challenge', badge_icon: 'Trophy', coins_reward: 100, trigger_event: 'CHALLENGE_APPLY' },
      { id: 3, title: 'Shark Tank Shortlist', description: 'Advanced through round 1 and earned an official judge shortlisting', badge_icon: 'Target', coins_reward: 200, trigger_event: 'SHORTLIST_EARNED' },
      { id: 4, title: 'MVP Architect', description: 'Completed all stage 5 roadmap milestones with verified evidence', badge_icon: 'ShieldCheck', coins_reward: 150, trigger_event: 'MVP_COMPLETED' },
      { id: 5, title: 'Ecosystem Champion', description: 'Ranked in the top 5 startups on the institutional leaderboard', badge_icon: 'Crown', coins_reward: 300, trigger_event: 'LEADERBOARD_TOP5' }
    ];

    // 17. User Achievements
    this.data.user_achievements = [
      { id: 1, user_id: 1, achievement_id: 1, awarded_at: new Date(Date.now() - 28 * 86400000).toISOString() },
      { id: 2, user_id: 1, achievement_id: 2, awarded_at: new Date(Date.now() - 20 * 86400000).toISOString() },
      { id: 3, user_id: 1, achievement_id: 3, awarded_at: new Date(Date.now() - 5 * 86400000).toISOString() }
    ];

    // 18. Coin Transactions
    this.data.coin_transactions = [
      { id: 1, user_id: 1, amount: 50, balance_after: 50, transaction_type: 'EARNED', reason: 'Welcome bonus on profile completion', reference_type: 'SYSTEM', reference_id: null, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 2, user_id: 1, amount: 50, balance_after: 100, transaction_type: 'EARNED', reason: 'Created startup TerraPulse IoT', reference_type: 'STARTUP', reference_id: 1, created_at: new Date(Date.now() - 28 * 86400000).toISOString() },
      { id: 3, user_id: 1, amount: 50, balance_after: 150, transaction_type: 'EARNED', reason: 'Applied to Smart City Decarbonization Challenge', reference_type: 'APPLICATION', reference_id: 1, created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
      { id: 4, user_id: 1, amount: 200, balance_after: 350, transaction_type: 'EARNED', reason: 'Application Shortlisted for Live Pitch', reference_type: 'APPLICATION', reference_id: 1, created_at: new Date(Date.now() - 5 * 86400000).toISOString() }
    ];

    // 19. Startup Roadmaps
    this.data.startup_roadmaps = [
      { id: 1, startup_id: 1, current_stage_index: 6, overall_progress: 60.00, updated_at: new Date().toISOString() },
      { id: 2, startup_id: 2, current_stage_index: 4, overall_progress: 40.00, updated_at: new Date().toISOString() }
    ];

    // 20. Roadmap Milestones for TerraPulse
    this.data.roadmap_milestones = [
      { id: 1, roadmap_id: 1, stage_number: 1, title: 'Problem Discovery & Customer Interviews', description: 'Interview at least 15 commercial building facility managers.', is_completed: true, completed_at: '2026-09-15', evidence_notes: 'Conducted 18 interviews across 3 commercial property managers in downtown district.' },
      { id: 2, roadmap_id: 1, stage_number: 2, title: 'Market & Competitive Landscape', description: 'Map TAM, SAM, and incumbent pricing models.', is_completed: true, completed_at: '2026-09-28', evidence_notes: 'Documented 4 key competitors and quantified $14B SAM.' },
      { id: 3, roadmap_id: 1, stage_number: 3, title: 'Technical Feasibility & Sensor Selection', description: 'Select low-power wireless transceivers and verify BACnet compatibility.', is_completed: true, completed_at: '2026-10-10', evidence_notes: 'Selected ESP32-S3 + Modbus/BACnet MSTP bridge.' },
      { id: 4, roadmap_id: 1, stage_number: 4, title: 'Alpha Lab Prototype Bench Testing', description: 'Bench test dynamic chiller control loop with simulator.', is_completed: true, completed_at: '2026-10-24', evidence_notes: 'Verified 28% simulated cooling reduction over ASHRAE benchmark.' },
      { id: 5, roadmap_id: 1, stage_number: 5, title: 'Field Pilot Installation', description: 'Deploy 5 test nodes in university engineering laboratory building.', is_completed: true, completed_at: '2026-11-02', evidence_notes: 'Installed in Building 4 Chiller Room. Streaming live telemetry.' },
      { id: 6, roadmap_id: 1, stage_number: 6, title: 'Commercial Pitch Deck & Financial Model', description: 'Build 10-slide venture deck with unit economics.', is_completed: true, completed_at: '2026-11-06', evidence_notes: 'Completed pitch deck v3 with 5-year pro-forma income statement.' },
      { id: 7, roadmap_id: 1, stage_number: 7, title: 'Shark Tank Live Presentation', description: 'Pitch to venture judging panel and answer technical questions.', is_completed: false, completed_at: null, evidence_notes: null },
      { id: 8, roadmap_id: 1, stage_number: 8, title: 'Government SIH Sandbox Deployment', description: 'Deploy pilot in municipal administration complex.', is_completed: false, completed_at: null, evidence_notes: null },
      { id: 9, roadmap_id: 1, stage_number: 9, title: 'First Commercial Paying Customer', description: 'Sign formal B2B pilot contract with facility manager.', is_completed: false, completed_at: null, evidence_notes: null },
      { id: 10, roadmap_id: 1, stage_number: 10, title: 'Series Seed Venture Financing', description: 'Secure seed round to scale manufacturing.', is_completed: false, completed_at: null, evidence_notes: null }
    ];

    // 21. Audit Logs
    this.data.audit_logs = [
      { id: 1, actor_id: 1, action: 'USER_REGISTERED', target_entity: 'users', target_id: 1, ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', metadata: { role: 'STUDENT' }, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 2, actor_id: 1, action: 'STARTUP_CREATED', target_entity: 'startups', target_id: 1, ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', metadata: { name: 'TerraPulse IoT' }, created_at: new Date(Date.now() - 28 * 86400000).toISOString() },
      { id: 3, actor_id: 1, action: 'APPLICATION_SUBMITTED', target_entity: 'applications', target_id: 1, ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', metadata: { challenge_id: 1 }, created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
      { id: 4, actor_id: 4, action: 'JUDGES_ASSIGNED', target_entity: 'applications', target_id: 1, ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', metadata: { judge_ids: [2, 3] }, created_at: new Date(Date.now() - 18 * 86400000).toISOString() },
      { id: 5, actor_id: 2, action: 'EVALUATION_SUBMITTED', target_entity: 'evaluations', target_id: 1, ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', metadata: { score: 88.5, recommendation: 'SHORTLIST' }, created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
      { id: 6, actor_id: 4, action: 'APPLICATION_SHORTLISTED', target_entity: 'applications', target_id: 1, ip_address: '127.0.0.1', user_agent: 'Mozilla/5.0', metadata: { status: 'SHORTLISTED', round: 2 }, created_at: new Date(Date.now() - 5 * 86400000).toISOString() }
    ];

    // 22. Government Innovation Departments (SIH Workflow)
    this.data.departments = [
      { id: 1, name: 'Ministry of Housing and Urban Affairs', code: 'MOHUA', contact_email: 'innovation@mohua.gov.in', created_at: new Date().toISOString() },
      { id: 2, name: 'Department of Science and Technology', code: 'DST', contact_email: 'grants@dst.gov.in', created_at: new Date().toISOString() }
    ];

    // 23. Pilots
    this.data.pilots = [
      {
        id: 1,
        application_id: 1,
        department_id: 1,
        sandbox_name: 'Municipal Smart Grid Energy Sandbox',
        status: 'PLANNED',
        budget: '$50,000 Sandbox Grant',
        start_date: '2027-01-10',
        end_date: '2027-06-30',
        created_at: new Date().toISOString()
      }
    ];

    // 24. KPIs
    this.data.kpis = [
      { id: 1, pilot_id: 1, kpi_name: 'Peak Power Reduction', target_value: '25.0', unit: '%', baseline_value: '0.0' },
      { id: 2, pilot_id: 1, kpi_name: 'Occupant Comfort Compliance', target_value: '98.0', unit: '%', baseline_value: '95.0' }
    ];
  }

  // Generic Query / Select Helper
  public select(table: keyof DatabaseState, predicate?: (row: any) => boolean): any[] {
    const list = this.data[table] || [];
    return predicate ? list.filter(predicate) : [...list];
  }

  public find(table: keyof DatabaseState, predicate: (row: any) => boolean): any | undefined {
    const list = this.data[table] || [];
    return list.find(predicate);
  }

  public insert(table: keyof DatabaseState, record: any): any {
    const list = this.data[table] || [];
    const maxId = list.reduce((max, r) => Math.max(max, r.id || 0), 0);
    const newRecord = {
      ...record,
      id: record.id || maxId + 1,
      created_at: record.created_at || new Date().toISOString()
    };
    list.push(newRecord);
    this.persist();
    return newRecord;
  }

  public update(table: keyof DatabaseState, id: number, updates: any): any | null {
    const list = this.data[table] || [];
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return list[index];
  }

  public delete(table: keyof DatabaseState, id: number): boolean {
    const list = this.data[table] || [];
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.persist();
    return true;
  }

  // Direct SQL-like execution interface compatible with mysql2
  public async query(sql: string, params: any[] = []): Promise<any> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // SELECT queries
    if (upper.startsWith('SELECT')) {
      return this.handleSelectSQL(trimmed, params);
    }

    // INSERT queries
    if (upper.startsWith('INSERT')) {
      return this.handleInsertSQL(trimmed, params);
    }

    // UPDATE queries
    if (upper.startsWith('UPDATE')) {
      return this.handleUpdateSQL(trimmed, params);
    }

    // DELETE queries
    if (upper.startsWith('DELETE')) {
      return this.handleDeleteSQL(trimmed, params);
    }

    return [];
  }

  private handleSelectSQL(sql: string, params: any[]): any[] {
    // Quick regex match: SELECT ... FROM table_name [WHERE ...]
    const match = sql.match(/FROM\s+([a-zA-Z_]+)/i);
    if (!match) return [];
    const tableName = match[1].toLowerCase() as keyof DatabaseState;
    const table = this.data[tableName];
    if (!table) return [];

    // Simple single equality filter support
    if (sql.toUpperCase().includes('WHERE')) {
      const whereMatch = sql.match(/WHERE\s+([a-zA-Z_]+)\s*=\s*\?/i);
      if (whereMatch && params.length > 0) {
        const col = whereMatch[1];
        const val = params[0];
        return table.filter((r: any) => r[col] == val);
      }
    }
    return [...table];
  }

  private handleInsertSQL(sql: string, params: any[]): any {
    const match = sql.match(/INSERT\s+INTO\s+([a-zA-Z_]+)/i);
    if (!match) return { insertId: 0, affectedRows: 0 };
    const tableName = match[1].toLowerCase() as keyof DatabaseState;
    const inserted = this.insert(tableName, params[0] || {});
    return { insertId: inserted.id, affectedRows: 1 };
  }

  private handleUpdateSQL(sql: string, params: any[]): any {
    const match = sql.match(/UPDATE\s+([a-zA-Z_]+)/i);
    if (!match) return { affectedRows: 0 };
    return { affectedRows: 1 };
  }

  private handleDeleteSQL(sql: string, params: any[]): any {
    const match = sql.match(/DELETE\s+FROM\s+([a-zA-Z_]+)/i);
    if (!match) return { affectedRows: 0 };
    return { affectedRows: 1 };
  }
}

export const db = new PitchArenaDatabase();
