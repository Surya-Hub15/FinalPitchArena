# PitchArena: Complete Architectural Blueprint & Master Development Plan

PitchArena is an AI-powered, gamified startup innovation and evaluation platform uniting student founders, expert judges, and program administrators into a single, cohesive venture-building ecosystem.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> PitchArena mandates three completely isolated, role-governed user experiences sharing a unified Express REST API and relational database schema. Please review the architectural decisions and execution phases below before code implementation begins.

- **Role Isolation Model**: Strict server-enforced RBAC (Role-Based Access Control) using signed JWTs and database session verification. A user registered as `STUDENT` can never call `JUDGE` or `ADMIN` endpoints regardless of client manipulation.
- **Database Engine & Compatibility**: Fully relational SQL architecture containing 33 normalized tables, foreign key cascades, and direct parameterized SQL execution (`mysql2`). To support the container dev server environment seamlessly while preserving strict MySQL wire compatibility, we provide both production MySQL scripts (`schema.sql`, `seed.sql`) and a local embedded SQL engine that adheres to identical relational constraints and SQL dialects.
- **Document & File Handling**: Multi-part upload pipeline with strict MIME type validation, SHA-256 integrity hashing, and size capping for pitch decks (PDF), logos (PNG/JPG/SVG), and business plans.
- **AI Engine Integration**: Server-proxied `@google/genai` integration with Gemini Flash for startup readiness scoring, market research validation, and interactive pitch structuring—ensuring API keys are never exposed to the client browser.

---

## A. Complete System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT BROWSER                                   │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                         React 19 + Tailwind CSS                          │   │
│   │                                                                          │   │
│   │  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────────┐  │   │
│   │  │ Student Dashboard │  │  Judge Workspace  │  │   Admin Command Ctr  │  │   │
│   │  │ (12 Sub-pages)    │  │  (8 Sub-pages)    │  │   (15 Sub-pages)     │  │   │
│   │  └─────────┬─────────┘  └─────────┬─────────┘  └──────────┬───────────┘  │   │
│   │            │                      │                       │              │   │
│   │  ┌─────────┴──────────────────────┴───────────────────────┴───────────┐  │   │
│   │  │      Public Portal (Home, Challenges, Leaderboard, Auth Views)     │  │   │
│   │  └────────────────────────────────┬───────────────────────────────────┘  │   │
│   │                                   │                                      │   │
│   │                 AuthContext & Axios Request Interceptors                 │   │
│   └───────────────────────────────────┬──────────────────────────────────────┘   │
└───────────────────────────────────────┼──────────────────────────────────────────┘
                                        │ HTTPS / JSON & Multipart
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             EXPRESS REST BACKEND                                 │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                        Security & Auth Pipeline                          │   │
│   │   authenticateToken ──▶ authorizeRole(Role) ──▶ rateLimiter ──▶ CSRF     │   │
│   └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                       │                                          │
│   ┌───────────────────────────────────┴──────────────────────────────────────┐   │
│   │                          Domain Route Handlers                           │   │
│   │   /api/auth       /api/student    /api/judge      /api/admin             │   │
│   │   /api/startups   /api/challenges /api/evaluations /api/ai /api/rewards  │   │
│   └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                       │                                          │
│   ┌───────────────────────────────────┴──────────────────────────────────────┐   │
│   │                          Service Business Logic                          │   │
│   │   ScoringEngine    WorkflowManager    GeminiAIService    AuditLogger     │   │
│   └───────────────────────────────────┬──────────────────────────────────────┘   │
└───────────────────────────────────────┼──────────────────────────────────────────┘
                                        │ Parameterized Queries & Transactions
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            RELATIONAL DATABASE TIER                              │
│                                                                                  │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────────────┐   │
│   │  users & profiles   │  │ startups & teams    │  │ challenges & apps      │   │
│   │  (RBAC, auth, logs) │  │ (milestones, road)  │  │ (rounds, reviews, docs)│   │
│   └─────────────────────┘  └─────────────────────┘  └────────────────────────┘   │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────────────┐   │
│   │ assignments & scores│  │ rewards & coins     │  │ pilots, KPIs & gov     │   │
│   │ (weighted rubrics)  │  │ (transactions, ranks│  │ (SIH & public sandbox) │   │
│   └─────────────────────┘  └─────────────────────┘  └────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## B. Page-by-Page Application Structure & Navigation Flow

### 1. Public Portal (Unauthenticated / Guest)
- `/`: **Landing Page** — Hero banner, platform value proposition, active featured innovation challenges, interactive Shark-Tank competition demo, quantitative ecosystem metrics, success stories, and conversion CTA.
- `/about`: Platform mission, institutional partners, advisory board, and evaluation philosophy.
- `/how-it-works`: Step-by-step interactive visual explainer for founders, judges, and challenge sponsors.
- `/challenges`: Public catalogue of active innovation challenges with search, category filtering, reward pool tags, and countdown clocks.
- `/challenges/:id`: Detailed challenge brief: problem statement, deliverables, eligibility rules, evaluation criteria, and deadline.
- `/features`: Deep dive into AI Startup Readiness, Shark Tank Evaluation Workspace, and Digital Gamification.
- `/leaderboard`: Public rankings of top startups, top innovators, and competition winners.
- `/faq`: Searchable knowledge base addressing student queries, judge honorariums, and evaluation rules.
- `/contact`: Partnership and support inquiries with direct submission handling.
- `/login`: Unified credentials gateway with role-aware redirection (`STUDENT`, `JUDGE`, `ADMIN`).
- `/register`: Student self-registration portal (always sets role = `STUDENT`).
- `/forgot-password` & `/reset-password/:token`: Secure tokenized password recovery.
- `/unauthorized`: 403 access denial screen with clear navigation back to the user's role-appropriate home.

### 2. Founder / Student Interface (`role = STUDENT`)
Layout: Left sticky sidebar ($260\text{px}$) + Top navigation bar with coin balance & notification center + Main content viewport.
- `/student/dashboard`: Welcome banner, profile completion meter, startup readiness summary, application pipeline status cards (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`), recent notifications, upcoming deadlines, and quick actions.
- `/student/challenges`: Filterable challenge explorer with eligibility matching badges.
- `/student/challenges/:id`: Challenge details + One-click "Apply with Startup" modal.
- `/student/startups`: Grid of registered ventures with edit, team management, and pitch asset links.
- `/student/startups/:id`: Comprehensive startup overview, traction milestones, pitch documents, and application history.
- `/student/applications`: Master list of submitted applications with status badges and action links.
- `/student/applications/:id`: Application tracking cockpit: visual multi-step progress bar, submitted documents, authorized judge feedback, scheduled pitch links, and revision submission form.
- `/student/team`: Team member roster, role assignment (Hustler, Hacker, Designer), email invitations, and skill profiles.
- `/student/ai-assistant`: Interactive conversational assistant powered by Gemini for idea stress-testing, TAM/SAM/SOM calculation, and challenge matching.
- `/student/pitch-studio`: 10-slide interactive pitch deck builder with AI critique, elevator pitch generator, and PDF export.
- `/student/roadmap`: Visual 10-stage venture milestone tracker from Idea Validation to Pilot Scale-up with evidence uploads.
- `/student/notifications`: Real-time alerts for judge feedback releases, revision requests, deadlines, and coin earnings.
- `/student/rewards`: Coin wallet, transaction ledger, achievement badges, and reward redemption catalogue.
- `/student/leaderboard`: Public and cohort rankings by coins, challenge points, and milestone velocity.
- `/student/profile`: Academic credentials, technical skills, avatar upload, and security settings.

### 3. Reviewer / Judge Interface (`role = JUDGE`)
Layout: Focused evaluation workspace layout with application queue and scoring drawer.
- `/judge/dashboard`: Workload analytics (Assigned, Pending, Completed), upcoming review deadlines, scheduled live pitch sessions, and recent score distribution.
- `/judge/applications`: Secure queue containing **only** applications officially assigned to this judge by administrators, filterable by status.
- `/judge/evaluate/:applicationId`: Split-screen evaluation cockpit:
  - *Left Pane*: Full startup profile, problem statement, market analysis, financial projections, team credentials, and embedded pitch deck viewer.
  - *Right Pane*: Structured 7-criteria weighted scoring matrix (Innovation 20%, Problem Relevance 15%, Technical Feasibility 20%, Market Potential 15%, Scalability 15%, Team Capability 10%, Presentation Quality 5%), strengths/weaknesses commentary, confidential notes, and official recommendation dropdown (`SHORTLIST`, `NEEDS_REVISION`, `REJECT`).
- `/judge/shortlisted`: Curated roster of high-scoring ventures advancing to live rounds.
- `/judge/sessions`: Scheduled video pitch sessions with join links, presentation rubrics, and real-time live scoring.
- `/judge/history`: Historical archive of submitted evaluations with read-only scorecards and audit timestamps.
- `/judge/notifications`: Instant notifications for new application assignments, deadline alerts, and schedule changes.
- `/judge/profile`: Industry expertise, domain credentials, bio, and availability settings.

### 4. Administrator Interface (`role = ADMIN`)
Layout: Executive operations center with comprehensive platform telemetry and administrative control panels.
- `/admin/dashboard`: Platform KPIs (Total Founders, Active Startups, Challenges, Applications, Judges, Evaluations), live submission trends, judge review velocity, and pending administrative actions.
- `/admin/users`: User management table with role filters, account status toggles (`ACTIVE`, `SUSPENDED`), and judge account invitation modal.
- `/admin/startups`: Master directory of all ventures, document verification status, and integrity flagging.
- `/admin/challenges`: Challenge creation and lifecycle management (`DRAFT`, `UPCOMING`, `ACTIVE`, `CLOSED`, `ARCHIVED`) with criteria configuration.
- `/admin/applications`: Central applications pipeline with bulk actions, round progression, and status updates.
- `/admin/applications/:id`: Administrative 360° view: startup data, assigned judges, submitted scorecards, score variance alerts, admin notes, and official decision buttons.
- `/admin/judges`: Judge directory, expertise tags, workload capacity monitoring, and evaluation completion rates.
- `/admin/assignments`: Smart assignment engine: assign single or multiple judges to applications, detect conflicts of interest, and set review deadlines.
- `/admin/evaluations`: Scoreboard comparing judge evaluations, variance flags (discrepancy > 25 points between judges), and evaluation unlock/reopen capabilities.
- `/admin/sessions`: Pitch session scheduler with calendar view, judge/startup pairings, and venue/meeting URL management.
- `/admin/results`: Official competition ranking generator, cut-off score selector, results publisher, and CSV/PDF export.
- `/admin/rewards`: Coin economy rules, achievement criteria definitions, and manual reward grants.
- `/admin/announcements`: Targeted notification broadcaster (All Users, Students Only, Judges Only, or Challenge Specific).
- `/admin/reports`: Exportable analytics on geographic spread, sector distribution, judge performance, and conversion funnels.
- `/admin/audit-logs`: Immutable chronological log of all sensitive actions (logins, status changes, score submissions, role updates) with actor IP and timestamps.
- `/admin/settings`: Global platform configuration, evaluation threshold defaults, email SMTP parameters, and security policies.

---

## C. Database Schema and Relationships (33 Relational Tables)

### Core User & Authentication Tables
1. `users`: `id` (PK, INT AUTO_INCREMENT), `email` (VARCHAR 255, UNIQUE), `password_hash` (VARCHAR 255), `role` (ENUM: `'STUDENT'`, `'JUDGE'`, `'ADMIN'`), `status` (ENUM: `'ACTIVE'`, `'SUSPENDED'`, `'PENDING'`), `is_email_verified` (BOOLEAN), `created_at`, `updated_at`.
2. `student_profiles`: `id` (PK), `user_id` (FK -> users.id, ON DELETE CASCADE), `full_name`, `avatar_url`, `phone`, `college_name`, `department`, `academic_year`, `bio`, `github_url`, `linkedin_url`, `skills` (JSON).
3. `judge_profiles`: `id` (PK), `user_id` (FK -> users.id, ON DELETE CASCADE), `full_name`, `avatar_url`, `organization`, `designation`, `domain_expertise` (JSON), `years_experience`, `bio`, `max_assignments_allowed`.
4. `refresh_tokens`: `id` (PK), `user_id` (FK -> users.id), `token_hash`, `expires_at`, `revoked_at`, `created_at`.
5. `password_reset_tokens`: `id` (PK), `user_id` (FK -> users.id), `token_hash`, `expires_at`, `used_at`.
6. `email_verification_tokens`: `id` (PK), `user_id` (FK -> users.id), `token_hash`, `expires_at`.

### Ventures, Teams & Roadmaps
7. `startups`: `id` (PK), `founder_id` (FK -> users.id), `name` (VARCHAR 255), `slug`, `logo_url`, `tagline`, `industry`, `stage` (ENUM: `'IDEA'`, `'PROTOTYPE'`, `'MVP'`, `'EARLY_TRACTION'`, `'SCALING'`), `problem_statement` (TEXT), `proposed_solution` (TEXT), `target_market` (TEXT), `business_model` (TEXT), `revenue_model` (TEXT), `competitors` (TEXT), `usp` (TEXT), `website_url`, `pitch_deck_url`, `readiness_score` (INT DEFAULT 0), `is_verified` (BOOLEAN), `created_at`, `updated_at`.
8. `teams`: `id` (PK), `startup_id` (FK -> startups.id, ON DELETE CASCADE), `name`, `created_at`.
9. `team_members`: `id` (PK), `team_id` (FK -> teams.id, ON DELETE CASCADE), `user_id` (FK -> users.id, NULLABLE for pending invites), `name`, `email`, `role_title`, `college`, `skills` (JSON), `invitation_status` (ENUM: `'INVITED'`, `'ACCEPTED'`, `'DECLINED'`), `created_at`.
10. `startup_roadmaps`: `id` (PK), `startup_id` (FK -> startups.id, ON DELETE CASCADE), `current_stage_index` (INT DEFAULT 1), `overall_progress` (DECIMAL 5,2), `updated_at`.
11. `roadmap_milestones`: `id` (PK), `roadmap_id` (FK -> startup_roadmaps.id, ON DELETE CASCADE), `stage_number`, `title`, `description`, `is_completed` (BOOLEAN), `completed_at`, `evidence_notes`, `evidence_url`.
12. `pitch_documents`: `id` (PK), `startup_id` (FK -> startups.id, ON DELETE CASCADE), `document_type` (ENUM: `'PITCH_DECK'`, `'ONE_PAGER'`, `'FINANCIALS'`, `'PATENT'`, `'OTHER'`), `file_name`, `file_url`, `file_size_bytes`, `created_at`.

### Challenges, Applications & Assignments
13. `challenges`: `id` (PK), `created_by` (FK -> users.id), `title`, `slug`, `organization`, `category`, `description` (TEXT), `problem_statement` (TEXT), `expected_solution` (TEXT), `eligibility` (TEXT), `required_skills` (JSON), `max_team_size` (INT), `prize_pool` (VARCHAR 255), `coins_reward` (INT), `status` (ENUM: `'DRAFT'`, `'UPCOMING'`, `'ACTIVE'`, `'CLOSED'`, `'ARCHIVED'`), `start_date`, `deadline`, `created_at`, `updated_at`.
14. `applications`: `id` (PK), `challenge_id` (FK -> challenges.id), `startup_id` (FK -> startups.id), `applicant_id` (FK -> users.id), `current_round` (INT DEFAULT 1), `status` (ENUM: `'DRAFT'`, `'SUBMITTED'`, `'UNDER_REVIEW'`, `'NEEDS_REVISION'`, `'SHORTLISTED'`, `'REJECTED'`, `'PITCH_SCHEDULED'`, `'PITCH_COMPLETED'`, `'PILOT'`, `'SELECTED'`, `'CLOSED'`), `revision_notes` (TEXT), `submitted_at`, `decision_published_at`, `created_at`, `updated_at`.
15. `application_files`: `id` (PK), `application_id` (FK -> applications.id, ON DELETE CASCADE), `file_type`, `file_name`, `file_url`, `file_size_bytes`, `created_at`.
16. `judge_assignments`: `id` (PK), `application_id` (FK -> applications.id, ON DELETE CASCADE), `judge_id` (FK -> users.id), `assigned_by` (FK -> users.id), `deadline`, `status` (ENUM: `'ASSIGNED'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'REVOKED'`), `conflict_declared` (BOOLEAN DEFAULT FALSE), `created_at`, `updated_at`.

### Evaluation & Scoring Engine
17. `evaluation_criteria`: `id` (PK), `name` (VARCHAR 100), `weight_percent` (DECIMAL 5,2), `description`, `is_active` (BOOLEAN DEFAULT TRUE). Default seed:
    - Innovation (20%)
    - Problem Relevance (15%)
    - Technical Feasibility (20%)
    - Market Potential (15%)
    - Scalability (15%)
    - Team Capability (10%)
    - Presentation Quality (5%)
18. `evaluations`: `id` (PK), `assignment_id` (FK -> judge_assignments.id, ON DELETE CASCADE), `application_id` (FK -> applications.id), `judge_id` (FK -> users.id), `weighted_score` (DECIMAL 5,2), `recommendation` (ENUM: `'SHORTLIST'`, `'NEEDS_REVISION'`, `'REJECT'`), `strengths` (TEXT), `weaknesses` (TEXT), `suggestions` (TEXT), `confidential_admin_notes` (TEXT), `is_locked` (BOOLEAN DEFAULT FALSE), `submitted_at`, `created_at`, `updated_at`.
19. `evaluation_scores`: `id` (PK), `evaluation_id` (FK -> evaluations.id, ON DELETE CASCADE), `criteria_id` (FK -> evaluation_criteria.id), `score` (DECIMAL 4,2, between 0.00 and 10.00), `notes` (TEXT).
20. `pitch_sessions`: `id` (PK), `application_id` (FK -> applications.id), `title`, `scheduled_at`, `duration_minutes`, `meeting_url`, `venue`, `status` (ENUM: `'SCHEDULED'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CANCELLED'`), `created_by` (FK -> users.id), `created_at`.

### Gamification, Rewards & Notifications
21. `coin_transactions`: `id` (PK), `user_id` (FK -> users.id), `amount` (INT), `balance_after` (INT), `transaction_type` (ENUM: `'EARNED'`, `'SPENT'`, `'ADJUSTMENT'`), `reason` (VARCHAR 255), `reference_type`, `reference_id`, `created_at`.
22. `achievements`: `id` (PK), `title`, `description`, `badge_icon`, `coins_reward`, `trigger_event` (VARCHAR 100), `created_at`.
23. `user_achievements`: `id` (PK), `user_id` (FK -> users.id), `achievement_id` (FK -> achievements.id), `awarded_at`.
24. `notifications`: `id` (PK), `user_id` (FK -> users.id), `title`, `message` (TEXT), `type` (ENUM: `'INFO'`, `'SUCCESS'`, `'WARNING'`, `'ACTION_REQUIRED'`), `link_url`, `is_read` (BOOLEAN DEFAULT FALSE), `created_at`.
25. `announcements`: `id` (PK), `sender_id` (FK -> users.id), `target_role` (ENUM: `'ALL'`, `'STUDENT'`, `'JUDGE'`), `challenge_id` (NULLABLE FK), `title`, `content` (TEXT), `created_at`.

### AI & Venture Intel
26. `ai_analyses`: `id` (PK), `startup_id` (FK -> startups.id), `analysis_type` (ENUM: `'READINESS_AUDIT'`, `'IDEA_VALIDATION'`, `'COMPETITOR_MAP'`, `'PITCH_CRITIQUE'`), `prompt_summary`, `analysis_json` (JSON), `created_at`.

### Audit & Security
27. `audit_logs`: `id` (PK), `actor_id` (FK -> users.id, NULLABLE), `action` (VARCHAR 100), `target_entity` (VARCHAR 100), `target_id` (INT), `ip_address`, `user_agent`, `metadata` (JSON), `created_at`.

### Extensible Sandbox & SIH Government Innovation
28. `departments`: `id` (PK), `name`, `code`, `contact_email`, `created_at`.
29. `pilots`: `id` (PK), `application_id` (FK -> applications.id), `department_id` (FK -> departments.id), `sandbox_name`, `status` (ENUM: `'PLANNED'`, `'ACTIVE'`, `'EVALUATION'`, `'SUCCESSFUL'`, `'CLOSED'`), `budget`, `start_date`, `end_date`.
30. `pilot_milestones`: `id` (PK), `pilot_id` (FK -> pilots.id), `milestone_name`, `target_date`, `is_validated` (BOOLEAN), `validator_notes` (TEXT).
31. `kpis`: `id` (PK), `pilot_id` (FK -> pilots.id), `kpi_name`, `target_value`, `unit`, `baseline_value`.
32. `kpi_measurements`: `id` (PK), `kpi_id` (FK -> kpis.id), `recorded_value`, `recorded_date`, `evidence_url`.
33. `procurement_records`: `id` (PK), `pilot_id` (FK -> pilots.id), `tender_reference`, `procurement_status`, `awarded_value`, `created_at`.

---

## D. Backend API Planning

### Authentication & Sessions (`/api/auth`)
- `POST /api/auth/register` — Public registration (strictly forces `role = 'STUDENT'`).
- `POST /api/auth/login` — Verifies email, checks bcrypt hash, checks account status, returns JWT access token + HTTP-only refresh token.
- `POST /api/auth/refresh` — Rotates refresh token and returns fresh access token.
- `POST /api/auth/logout` — Revokes active refresh token.
- `GET /api/auth/me` — Returns current authenticated user and profile payload.
- `POST /api/auth/forgot-password` — Generates 1-hour secure password reset token.
- `POST /api/auth/reset-password` — Validates token and resets bcrypt hash.

### Student Endpoints (`/api/student`, `role = STUDENT`)
- `GET /api/student/dashboard` — Live counts, application status breakdown, readiness summary, upcoming deadlines.
- `GET/PUT /api/student/profile` — Read/update student personal information, skills, and portfolio links.
- `GET /api/student/startups` & `POST /api/student/startups` — List and create founder ventures.
- `GET/PUT /api/student/startups/:id` — Venture detail and multi-attribute edit (with ownership check).
- `GET /api/student/startups/:id/team` & `POST /api/student/startups/:id/team/invite` — Team roster & invite dispatch.
- `GET /api/student/challenges` & `GET /api/student/challenges/:id` — Published challenges with eligibility matching.
- `GET /api/student/applications` & `POST /api/student/applications` — Applications list and challenge submission.
- `GET /api/student/applications/:id` — Full application tracking, timeline, and authorized judge feedback.
- `PUT /api/student/applications/:id/revise` — Submit revised pitch deck/documentation requested by judges.
- `GET/PUT /api/student/roadmap/:startupId` — Read and toggle completed roadmap milestones.
- `GET /api/student/rewards` & `GET /api/student/leaderboard` — Coins wallet, transaction history, and ranks.
- `GET /api/student/notifications` & `PATCH /api/student/notifications/:id/read` — Alert notifications management.

### Judge Endpoints (`/api/judge`, `role = JUDGE`)
- `GET /api/judge/dashboard` — Assigned queue metrics, completed evaluations, and pending deadlines.
- `GET /api/judge/applications` — Only returns applications assigned to the requesting judge.
- `GET /api/judge/applications/:id` — Deep view of assigned application and startup materials (ownership enforced).
- `POST /api/judge/evaluations` — Submit structured 7-criteria scorecard, feedback, and recommendation.
- `PUT /api/judge/evaluations/:id` — Save scorecard draft before final locking.
- `GET /api/judge/evaluations` — History of evaluations submitted by this judge.
- `GET /api/judge/sessions` — Scheduled live pitch sessions for this judge.
- `GET/PUT /api/judge/profile` — Professional expertise and reviewer capacity settings.

### Administrator Endpoints (`/api/admin`, `role = ADMIN`)
- `GET /api/admin/dashboard` — Platform telemetry, active user counts, funnel rates, review velocity.
- `GET /api/admin/users` & `PATCH /api/admin/users/:id/status` — User roster and account suspension/activation.
- `POST /api/admin/judges` — Invite/create new vetted judge profile.
- `GET /api/admin/startups` — All registered startups with verification flags.
- `GET/POST/PUT /api/admin/challenges` — Full challenge lifecycle CRUD.
- `GET /api/admin/applications` & `GET /api/admin/applications/:id` — Application directory and detailed audit cockpit.
- `PATCH /api/admin/applications/:id/status` — Advance application round or change official status.
- `POST /api/admin/assignments` — Assign 1 or more judges to an application with review deadlines.
- `GET /api/admin/evaluations` — Comprehensive evaluation scoreboard and score variance detection.
- `POST /api/admin/evaluations/:id/unlock` — Administrative unlock of locked evaluation for corrections.
- `POST /api/admin/sessions` — Schedule pitch sessions linking startup, judges, and venue.
- `POST /api/admin/results/publish` — Finalize competition winners and publish scores to student dashboards.
- `GET /api/admin/audit-logs` — Chronological security audit logs.
- `POST /api/admin/announcements` — Broadcast announcements to specific user cohorts.
- `GET /api/admin/reports` — Analytics export in JSON/CSV format.

### AI Engine (`/api/ai`, Authenticated)
- `POST /api/ai/analyze-idea` — Deep evaluation of problem/solution fit, TAM/SAM/SOM, and competitor landscape.
- `POST /api/ai/readiness-score` — Multi-factor algorithmic calculation of startup readiness (0–100).
- `POST /api/ai/improve-pitch` — Slide-by-slide pitch critique and executive summary enhancement.
- `POST /api/ai/match-challenges` — Smart semantic challenge recommendation based on startup attributes.

### File Storage (`/api/upload`, Authenticated)
- `POST /api/upload` — Multi-part handler validating file extensions (`.pdf`, `.png`, `.jpg`), generating collision-free hashes, and returning file metadata.

---

## E. Authentication and Authorization Strategy

1. **Role Enforcement**:
   - `authenticateToken` middleware decodes and verifies the Bearer JWT.
   - `authorizeRole(['STUDENT'])`, `authorizeRole(['JUDGE'])`, `authorizeRole(['ADMIN'])` guards every single endpoint.
   - Role spoofing is impossible because role information is extracted directly from the verified cryptographically signed token payload and checked against active database records.
2. **Resource Ownership Guarding**:
   - A student can only view/edit startups where `founder_id = req.user.id` or they are an accepted team member.
   - A judge can only access an application if a row exists in `judge_assignments` where `judge_id = req.user.id` and `application_id = req.params.id`.
   - Admin routes have omniscient access, with every administrative mutation logged to `audit_logs`.
3. **Password Security**:
   - Bcrypt with 10 salt rounds. Plaintext passwords never touch database logs.
4. **Token Handling**:
   - Access tokens have a 15-minute expiration; refresh tokens have a 7-day expiration with single-use rotation.

---

## F. Complete End-to-End User Workflows

```
  FOUNDER JOURNEY                  ADMINISTRATOR COCKPIT                 JUDGE WORKSPACE
  ───────────────                  ─────────────────────                 ───────────────
1. Registers as Student
2. Builds Startup Profile
3. Runs AI Readiness Audit
4. Submits to Challenge ─────────▶ 5. Receives New Application
                                   6. Screens Eligibility
                                   7. Assigns 2 Independent Judges ────▶ 8. Sees Assigned App
                                                                         9. Evaluates 7 Criteria
                                   11. Reviews Judge Scores ◀─────────── 10. Submits Final Score
                                   12. Approves Shortlist
14. Receives Shortlist Alert ◀─────13. Publishes Official Result
15. Attends Scheduled Pitch ───────────────────────────────────────────▶ 16. Scores Live Pitch
17. Advances to Pilot Sandbox ───▶ 18. Oversees Government KPI Delivery
```

---

## G. Module-Wise Development Roadmap

- **Module 1: Core Framework & Database Bootstrap**
  - Setup unified Vite + React + Express architecture (`server.ts`).
  - Deploy SQL relational schema, constraints, and comprehensive seed data for all three roles.
- **Module 2: Authentication & RBAC Engine**
  - JWT generation, password hashing, session recovery, route guards, and AuthContext.
- **Module 3: Public Website & Portal**
  - High-converting landing page, public challenges catalog, how-it-works, FAQs, and leaderboard.
- **Module 4: Student Interface & Venture Workspace**
  - Student dashboard, startup builder, team manager, and challenge submission wizard.
- **Module 5: Judge Interface & Evaluation Cockpit**
  - Judge dashboard, assigned queue, split-screen scoring engine, and weighted calculation formula.
- **Module 6: Administrator Command Center**
  - User management, challenge authoring, smart judge assignment, variance detector, and results publisher.
- **Module 7: AI Startup Assistant & Pitch Studio**
  - Gemini-powered idea analyzer, readiness calculator, pitch deck builder, and milestone roadmap.
- **Module 8: Gamification, Rewards & Notification Pipeline**
  - Coins economy, badge achievements, and in-app alert notifications.
- **Module 9: Audit Logs & Security Hardening**
  - IDOR protection verification, input sanitization, error boundaries, and telemetry audit trail.

---

## H. Testing and Security Checklist

- [ ] **Role Boundary Test**: Verify `GET /api/admin/users` returns HTTP 403 Forbidden when invoked with a Student or Judge JWT.
- [ ] **Judge Queue Isolation**: Verify Judge A cannot inspect or submit evaluations for an application assigned exclusively to Judge B.
- [ ] **Founder Ownership Test**: Verify Student A cannot edit Student B's startup profile or submitted documents.
- [ ] **Weighted Math Precision**: Verify that a 7-criteria scorecard accurately computes `(Innovation*0.2 + Relevance*0.15 + Feasibility*0.2 + Market*0.15 + Scalability*0.15 + Team*0.1 + Presentation*0.05) * 10` to exact decimal precision.
- [ ] **Locked Evaluation Invariance**: Verify that once an evaluation is submitted, subsequent updates fail unless an administrator explicitly unlocks the evaluation record.
- [ ] **Input Sanitization**: Parameterized queries across all database calls preventing SQL injection.
- [ ] **Safe AI Fallback**: If the Gemini API is unreachable, ensure the application presents clear user-friendly guidance while all core application submission and judging features remain 100% operational.

---

## I. Recommended Technology Choices

- **Frontend**: React 19, Tailwind CSS v4, Lucide React icons, Recharts for visual analytics, React Router DOM.
- **Backend**: Node.js, Express REST API, TypeScript, parameterized SQL query layer with full schema and seed files.
- **AI Engine**: `@google/genai` with `gemini-2.5-flash` for high-speed, cost-effective startup readiness assessments and ideation feedback.
- **Security**: Signed JSON Web Tokens, bcrypt password encryption, and structured audit logs.

---

## J. Standout Innovations

1. **Dual-Lens Shark Tank Cockpit**: A real-time split-screen interface allowing judges to review slides, metrics, and video live while scoring across an interactive weighted rubric.
2. **Algorithmic Venture Readiness Radar**: A multi-dimensional radar chart measuring Problem Clarity, Technical Feasibility, Market Scale, and Team Strength before a founder submits to a challenge.
3. **Smart Conflict-of-Interest Detector**: Automatically warns administrators if an assigned judge shares an institutional affiliation or past collaboration with a student team.
4. **Government Innovation & SIH Sandbox**: Ready-made workflow extending the platform into municipal and government challenges with KPI milestone tracking and pilot validation.

---

## Execution Sequence

1. **Phase 1**: Database schema creation, relational seeding, and Express REST server setup.
2. **Phase 2**: Authentication middleware, RBAC controllers, and AuthContext.
3. **Phase 3**: Student portal, startup profiles, and challenge application workflow.
4. **Phase 4**: Judge workspace, assignment engine, and weighted scoring cockpit.
5. **Phase 5**: Admin management center, score variance review, and results publishing.
6. **Phase 6**: AI Startup Assistant, Pitch Studio, Gamified Rewards, and final security audit.
