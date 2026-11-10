-- PitchArena Seed Data Script
-- Default Accounts:
-- Student: founder@pitcharena.dev (password: password123)
-- Judge 1: judge@pitcharena.dev (password: password123)
-- Judge 2: dr.chen@pitcharena.dev (password: password123)
-- Admin:   admin@pitcharena.dev (password: password123)

-- Insert evaluation criteria
INSERT INTO evaluation_criteria (id, name, weight_percent, description) VALUES
(1, 'Innovation & Originality', 20.00, 'Novelty of approach, intellectual property potential, and differentiation from existing solutions.'),
(2, 'Problem Relevance & Urgency', 15.00, 'Depth of customer pain point, validated need, and societal or market necessity.'),
(3, 'Technical Feasibility', 20.00, 'Viability of implementation, architecture robustness, and deliverability with realistic tech stack.'),
(4, 'Market Potential & TAM', 15.00, 'Total addressable market size, target audience clarity, and clear commercialization path.'),
(5, 'Scalability & Unit Economics', 15.00, 'Operating leverage, CAC/LTV trajectory, and ability to expand to multi-regional adoption.'),
(6, 'Team Capability & Diversity', 10.00, 'Complementary domain skills, founder grit, execution history, and advisory board quality.'),
(7, 'Presentation & Pitch Quality', 5.00, 'Clarity of communication, slide narrative discipline, and objection-handling confidence.');

-- Insert achievement badges
INSERT INTO achievements (id, title, description, badge_icon, coins_reward, trigger_event) VALUES
(1, 'Genesis Pitch', 'Created and submitted your first verified startup profile', 'Sparkles', 50, 'FIRST_STARTUP'),
(2, 'Arena Contender', 'Officially applied to your first competitive innovation challenge', 'Trophy', 100, 'CHALLENGE_APPLY'),
(3, 'Shark Tank Shortlist', 'Advanced through round 1 and earned an official judge shortlisting', 'Target', 200, 'SHORTLIST_EARNED'),
(4, 'MVP Architect', 'Completed all stage 5 roadmap milestones with verified evidence', 'ShieldCheck', 150, 'MVP_COMPLETED'),
(5, 'Ecosystem Champion', 'Ranked in the top 5 startups on the institutional leaderboard', 'Crown', 300, 'LEADERBOARD_TOP5');
