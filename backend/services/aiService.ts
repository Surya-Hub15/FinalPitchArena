import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed initializing GoogleGenAI client:', err);
  }
}

export interface IdeaAnalysisResult {
  problem_analysis: string;
  proposed_solution_analysis: string;
  target_customers: string[];
  suggested_industry: string;
  potential_business_models: string[];
  strengths: string[];
  weaknesses: string[];
  development_suggestions: string[];
  validation_checklist: string[];
  estimated_readiness_score: number;
  is_ai_generated: boolean;
}

export async function analyzeStartupIdea(idea: {
  name?: string;
  tagline?: string;
  industry?: string;
  problem_statement: string;
  proposed_solution: string;
  target_market?: string;
}): Promise<IdeaAnalysisResult> {
  const prompt = `You are an elite Silicon Valley venture capitalist, tech incubator director, and startup mentor.
Analyze the following student/founder startup concept objectively and thoroughly:

Startup Name: ${idea.name || 'Unnamed Concept'}
Industry / Domain: ${idea.industry || 'Not specified'}
Problem Statement: ${idea.problem_statement}
Proposed Solution: ${idea.proposed_solution}
Target Market: ${idea.target_market || 'Early adopters'}

Respond strictly with a valid JSON object matching this schema:
{
  "problem_analysis": "2-3 sentences evaluating urgency, depth, and customer pain point validity.",
  "proposed_solution_analysis": "2-3 sentences analyzing technical viability, defendability, and execution risk.",
  "target_customers": ["customer segment 1", "customer segment 2", "customer segment 3"],
  "suggested_industry": "Primary industry classification",
  "potential_business_models": ["B2B SaaS tier", "Transaction take rate", "Hardware-enabled services"],
  "strengths": ["Key competitive advantage 1", "Advantage 2", "Advantage 3"],
  "weaknesses": ["Key vulnerability 1", "Vulnerability 2", "Vulnerability 3"],
  "development_suggestions": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "validation_checklist": ["Milestone 1", "Milestone 2", "Milestone 3", "Milestone 4"],
  "estimated_readiness_score": 75
}`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          ...parsed,
          is_ai_generated: true
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local heuristic analysis:', err);
    }
  }

  // Robust domain-grounded heuristic fallback
  return generateHeuristicAnalysis(idea);
}

export async function calculateReadinessScore(startup: any): Promise<{
  overall_score: number;
  breakdown: {
    problem_clarity: number;
    solution_quality: number;
    market_potential: number;
    business_model: number;
    technical_feasibility: number;
    team_readiness: number;
  };
  recommendations: string[];
}> {
  let problemScore = 70;
  let solutionScore = 70;
  let marketScore = 65;
  let bizScore = 65;
  let techScore = 70;
  let teamScore = 75;

  if (startup.problem_statement && startup.problem_statement.length > 100) problemScore += 15;
  if (startup.proposed_solution && startup.proposed_solution.length > 100) solutionScore += 15;
  if (startup.target_market && startup.target_market.length > 50) marketScore += 20;
  if (startup.business_model && startup.revenue_model) bizScore += 25;
  if (startup.stage === 'MVP' || startup.stage === 'EARLY_TRACTION') techScore += 20;
  else if (startup.stage === 'PROTOTYPE') techScore += 10;

  const overall = Math.round(
    (problemScore * 0.2) +
    (solutionScore * 0.2) +
    (marketScore * 0.15) +
    (bizScore * 0.15) +
    (techScore * 0.2) +
    (teamScore * 0.1)
  );

  return {
    overall_score: Math.min(100, overall),
    breakdown: {
      problem_clarity: Math.min(100, problemScore),
      solution_quality: Math.min(100, solutionScore),
      market_potential: Math.min(100, marketScore),
      business_model: Math.min(100, bizScore),
      technical_feasibility: Math.min(100, techScore),
      team_readiness: Math.min(100, teamScore)
    },
    recommendations: [
      'Conduct 10+ discovery interviews with target buyers to corroborate willingness-to-pay.',
      'Quantify the Total Addressable Market (TAM) with bottom-up calculation rather than top-down industry reports.',
      'Document a clear unit economics model including customer acquisition cost (CAC) and customer lifetime value (LTV) assumptions.',
      'Complete alpha prototype bench testing to showcase empirical performance evidence to competition reviewers.'
    ]
  };
}

export async function improvePitchDeck(pitchContent: {
  title: string;
  problem: string;
  solution: string;
  market: string;
  business_model: string;
}): Promise<{
  elevator_pitch: string;
  tagline: string;
  slide_improvements: Array<{ slide: string; current_summary: string; recommendation: string }>;
}> {
  return {
    elevator_pitch: `For ${pitchContent.market || 'modern enterprises'}, ${pitchContent.title} is an innovative solution that solves ${pitchContent.problem?.slice(0, 80) || 'critical operational friction'} through ${pitchContent.solution?.slice(0, 80) || 'proprietary automation'}, delivering high operating margins and rapid ROI.`,
    tagline: `Next-Generation ${pitchContent.title}: Transforming Industry Workflows with Defensible Tech`,
    slide_improvements: [
      {
        slide: 'Problem & Customer Pain',
        current_summary: pitchContent.problem?.slice(0, 100) || 'Problem statement outline',
        recommendation: 'Anchor the problem in quantified financial loss (e.g. "enterprises lose $420k annually") rather than abstract operational friction.'
      },
      {
        slide: 'Proprietary Solution & Moat',
        current_summary: pitchContent.solution?.slice(0, 100) || 'Proposed solution description',
        recommendation: 'Emphasize the unique technological moat or intellectual property that makes your approach 10x faster, cheaper, or more reliable than incumbents.'
      },
      {
        slide: 'Business Model & Unit Economics',
        current_summary: pitchContent.business_model?.slice(0, 100) || 'Revenue model summary',
        recommendation: 'Show clear pricing tiers with customer payback period under 12 months to prove commercial viability to risk-averse evaluators.'
      }
    ]
  };
}

function generateHeuristicAnalysis(idea: any): IdeaAnalysisResult {
  const isHardware = (idea.problem_statement + idea.proposed_solution).toLowerCase().includes('sensor') ||
                     (idea.problem_statement + idea.proposed_solution).toLowerCase().includes('hardware') ||
                     (idea.problem_statement + idea.proposed_solution).toLowerCase().includes('iot');

  return {
    problem_analysis: `The identified problem indicates a strong real-world pain point with genuine market relevance. Key urgency stems from efficiency deficits and regulatory compliance requirements in the target sector.`,
    proposed_solution_analysis: `The proposed approach demonstrates clear differentiation through automation and data-driven feedback. Technical execution risk centers on initial prototype calibration and reliable integration into existing workflows.`,
    target_customers: [
      'Commercial facility asset managers and technical operators',
      'Mid-market enterprises seeking rapid operational efficiency gains',
      'Specialized engineering and compliance departments'
    ],
    suggested_industry: idea.industry || (isHardware ? 'CleanTech & IoT' : 'Enterprise SaaS & AI'),
    potential_business_models: [
      'Tiered B2B SaaS Subscription (Monthly / Annual Recurring)',
      'Hardware-as-a-Service (HaaS) with bundled telemetry software',
      'Performance-based energy or operational cost-saving share'
    ],
    strengths: [
      'Direct, measurable financial return on investment for customers',
      'Clear technological value proposition over legacy manual solutions',
      'High stickiness once integrated into daily operational workflows'
    ],
    weaknesses: [
      'Long initial enterprise sales cycle during procurement evaluation',
      'Integration overhead with legacy proprietary protocols',
      'Early founder reliance on single-channel outbound customer discovery'
    ],
    development_suggestions: [
      'Build a lightweight clickable prototype or bench demo to show live telemetry before building full manufacturing run.',
      'Partner with 2 pilot beta testing sites to gather verifiable testimonial letters for competition judges.',
      'Refine the go-to-market plan focusing on a hyper-niche beachhead segment before expanding horizontally.'
    ],
    validation_checklist: [
      'Complete 15 problem-validation customer interviews',
      'Publish bench prototype performance benchmarks',
      'Calculate bottom-up serviceable obtainable market (SOM)',
      'Secure at least 1 written letter of intent (LOI) or sandbox testing agreement'
    ],
    estimated_readiness_score: 78,
    is_ai_generated: false
  };
}
