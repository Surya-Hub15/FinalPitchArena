import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { analyzeStartupIdea, calculateReadinessScore, improvePitchDeck } from '../services/aiService.ts';
import { db } from '../db/database.ts';

const router = Router();

router.use(authenticateToken);

// 1. Analyze Idea
router.post('/analyze-idea', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { problem_statement, proposed_solution, industry, name, target_market, startup_id } = req.body;

    if (!problem_statement || !proposed_solution) {
      res.status(400).json({ success: false, error: 'Problem statement and proposed solution are required.' });
      return;
    }

    const analysis = await analyzeStartupIdea({
      name,
      industry,
      problem_statement,
      proposed_solution,
      target_market
    });

    if (startup_id) {
      db.insert('ai_analyses', {
        startup_id: parseInt(startup_id, 10),
        analysis_type: 'IDEA_VALIDATION',
        prompt_summary: problem_statement.slice(0, 200),
        analysis_json: analysis
      });

      // Update startup readiness score if provided
      const startup = db.find('startups', s => s.id === parseInt(startup_id, 10));
      if (startup && startup.founder_id === req.user!.id) {
        db.update('startups', startup.id, {
          readiness_score: analysis.estimated_readiness_score || startup.readiness_score
        });
      }
    }

    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error processing AI analysis.' });
  }
});

// 2. Readiness Score Calculation
router.post('/readiness-score', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startup_id } = req.body;
    let startup = null;

    if (startup_id) {
      startup = db.find('startups', s => s.id === parseInt(startup_id, 10));
    }

    const startupPayload = startup || req.body;
    const scoreResult = await calculateReadinessScore(startupPayload);

    if (startup && startup.founder_id === req.user!.id) {
      db.update('startups', startup.id, {
        readiness_score: scoreResult.overall_score
      });
    }

    res.json({ success: true, data: scoreResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error calculating readiness score.' });
  }
});

// 3. Improve Pitch Deck
router.post('/improve-pitch', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, problem, solution, market, business_model } = req.body;
    const result = await improvePitchDeck({ title, problem, solution, market, business_model });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error improving pitch.' });
  }
});

// 4. Match Challenges
router.post('/match-challenges', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startup_id } = req.body;
    const startup = db.find('startups', s => s.id === parseInt(startup_id, 10));

    if (!startup) {
      res.status(404).json({ success: false, error: 'Startup not found.' });
      return;
    }

    const challenges = db.select('challenges', c => c.status === 'ACTIVE');

    const matches = challenges.map(ch => {
      let score = 60;
      const reasons: string[] = [];

      if (startup.industry && ch.category && ch.category.toLowerCase().includes(startup.industry.toLowerCase().split(' ')[0])) {
        score += 25;
        reasons.push(`Industry overlap: ${startup.industry} aligns with ${ch.category}`);
      }

      if (startup.stage === 'MVP' || startup.stage === 'PROTOTYPE') {
        score += 10;
        reasons.push(`Venture stage (${startup.stage}) matches competition requirements.`);
      }

      reasons.push(`Problem domain matches ${ch.organization} objectives.`);

      return {
        challenge: ch,
        match_percentage: Math.min(98, score),
        reasons
      };
    }).sort((a, b) => b.match_percentage - a.match_percentage);

    res.json({ success: true, data: matches });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error matching challenges.' });
  }
});

export default router;
