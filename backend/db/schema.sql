-- PitchArena Relational Database Schema
-- Dialect: MySQL 8.0+
-- Database: pitcharena_db

CREATE DATABASE IF NOT EXISTS pitcharena_db;
USE pitcharena_db;

-- 1. Users table (Central identity for all three roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'JUDGE', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    is_email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. Student profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(30),
    college_name VARCHAR(255),
    department VARCHAR(150),
    academic_year VARCHAR(50),
    bio TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    skills JSON,
    coins_balance INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Judge profiles table
CREATE TABLE IF NOT EXISTS judge_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(30),
    organization VARCHAR(255) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    domain_expertise JSON,
    years_experience INT DEFAULT 5,
    bio TEXT,
    max_assignments_allowed INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Startups table
CREATE TABLE IF NOT EXISTS startups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    founder_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    tagline VARCHAR(300),
    industry VARCHAR(100) NOT NULL,
    stage ENUM('IDEA', 'PROTOTYPE', 'MVP', 'EARLY_TRACTION', 'SCALING') NOT NULL DEFAULT 'IDEA',
    problem_statement TEXT NOT NULL,
    proposed_solution TEXT NOT NULL,
    target_market TEXT,
    business_model TEXT,
    revenue_model TEXT,
    competitors TEXT,
    usp TEXT,
    website_url VARCHAR(255),
    pitch_deck_url VARCHAR(500),
    readiness_score INT DEFAULT 45,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (founder_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_startup_founder (founder_id),
    INDEX idx_startup_industry (industry)
) ENGINE=InnoDB;

-- 6. Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    college VARCHAR(255),
    skills JSON,
    invitation_status ENUM('INVITED', 'ACCEPTED', 'DECLINED') DEFAULT 'ACCEPTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_by INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    expected_solution TEXT NOT NULL,
    eligibility TEXT,
    required_skills JSON,
    max_team_size INT DEFAULT 5,
    prize_pool VARCHAR(100),
    coins_reward INT DEFAULT 150,
    status ENUM('DRAFT', 'UPCOMING', 'ACTIVE', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_challenge_status (status)
) ENGINE=InnoDB;

-- 9. Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    startup_id INT NOT NULL,
    applicant_id INT NOT NULL,
    current_round INT DEFAULT 1,
    status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'SHORTLISTED', 'REJECTED', 'PITCH_SCHEDULED', 'PITCH_COMPLETED', 'PILOT', 'SELECTED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
    revision_notes TEXT,
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_app_status (status),
    INDEX idx_app_challenge (challenge_id),
    INDEX idx_app_startup (startup_id)
) ENGINE=InnoDB;

-- 10. Application files table
CREATE TABLE IF NOT EXISTS application_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Judge assignments table
CREATE TABLE IF NOT EXISTS judge_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    judge_id INT NOT NULL,
    assigned_by INT NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVOKED') NOT NULL DEFAULT 'ASSIGNED',
    conflict_declared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY uk_app_judge (application_id, judge_id)
) ENGINE=InnoDB;

-- 12. Evaluation criteria table
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    weight_percent DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 13. Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL UNIQUE,
    application_id INT NOT NULL,
    judge_id INT NOT NULL,
    weighted_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    recommendation ENUM('SHORTLIST', 'NEEDS_REVISION', 'REJECT') NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    suggestions TEXT,
    confidential_admin_notes TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES judge_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Evaluation scores per criterion
CREATE TABLE IF NOT EXISTS evaluation_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(4,2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Pitch sessions
CREATE TABLE IF NOT EXISTS pitch_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT DEFAULT 20,
    meeting_url VARCHAR(500),
    venue VARCHAR(255),
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- 16. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ACTION_REQUIRED') DEFAULT 'INFO',
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- 17. Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    target_role ENUM('ALL', 'STUDENT', 'JUDGE') DEFAULT 'ALL',
    challenge_id INT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 18. Coin transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    transaction_type ENUM('EARNED', 'SPENT', 'ADJUSTMENT') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference_type VARCHAR(100),
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. Achievements catalog
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(100) NOT NULL,
    coins_reward INT NOT NULL DEFAULT 50,
    trigger_event VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 20. User achievements unlock
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_ach (user_id, achievement_id)
) ENGINE=InnoDB;

-- 21. Startup roadmaps
CREATE TABLE IF NOT EXISTS startup_roadmaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL UNIQUE,
    current_stage_index INT DEFAULT 1,
    overall_progress DECIMAL(5,2) DEFAULT 10.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 22. Roadmap milestones
CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    stage_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    evidence_notes TEXT,
    evidence_url VARCHAR(500),
    FOREIGN KEY (roadmap_id) REFERENCES startup_roadmaps(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 23. AI analyses cache & records
CREATE TABLE IF NOT EXISTS ai_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    analysis_type ENUM('READINESS_AUDIT', 'IDEA_VALIDATION', 'COMPETITOR_MAP', 'PITCH_CRITIQUE') NOT NULL,
    prompt_summary VARCHAR(500),
    analysis_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 24. Pitch documents
CREATE TABLE IF NOT EXISTS pitch_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    document_type ENUM('PITCH_DECK', 'ONE_PAGER', 'FINANCIALS', 'PATENT', 'OTHER') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 25. Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_id INT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- 26. Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 27. Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 28. Government innovation departments
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 29. Innovation pilots (Smart India Hackathon / Gov Sandbox)
CREATE TABLE IF NOT EXISTS pilots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    department_id INT NOT NULL,
    sandbox_name VARCHAR(255) NOT NULL,
    status ENUM('PLANNED', 'ACTIVE', 'EVALUATION', 'SUCCESSFUL', 'CLOSED') DEFAULT 'PLANNED',
    budget VARCHAR(100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 30. Pilot milestones
CREATE TABLE IF NOT EXISTS pilot_milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pilot_id INT NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    validator_notes TEXT,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 31. KPIs
CREATE TABLE IF NOT EXISTS kpis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pilot_id INT NOT NULL,
    kpi_name VARCHAR(255) NOT NULL,
    target_value VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    baseline_value VARCHAR(100),
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 32. KPI measurements
CREATE TABLE IF NOT EXISTS kpi_measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kpi_id INT NOT NULL,
    recorded_value VARCHAR(100) NOT NULL,
    recorded_date DATE NOT NULL,
    evidence_url VARCHAR(500),
    FOREIGN KEY (kpi_id) REFERENCES kpis(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 33. Procurement records
CREATE TABLE IF NOT EXISTS procurement_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pilot_id INT NOT NULL,
    tender_reference VARCHAR(150),
    procurement_status VARCHAR(100),
    awarded_value VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE
) ENGINE=InnoDB;
