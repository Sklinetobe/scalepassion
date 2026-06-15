export interface Question {
  id: string;
  cat: string;
  tf: string;
  te: string;
  type?: 'scale' | 'open';
}

export const QUESTIONS: Question[] = [
  { id: 'vision', cat: 'Vision clarity', tf: 'I have a clear vision for where this company is going in the next 2-3 years.', te: 'The founder has a clear vision for where this company is going in the next 2-3 years.' },
  { id: 'decisions', cat: 'Decision-making', tf: 'I trust my team to make important decisions without me.', te: 'I feel empowered to make decisions that matter without waiting for the founder.' },
  { id: 'culture', cat: 'Culture', tf: 'The culture we have today reflects the values I intended when I started this company.', te: 'The culture here reflects the values the leadership says we stand for.' },
  { id: 'info', cat: 'Information flow', tf: 'My team understands the real constraints and trade-offs the business faces right now.', te: 'I understand the real constraints and trade-offs the business faces right now.' },
  { id: 'recognition', cat: 'Recognition', tf: 'My team feels recognized and valued for the work they do.', te: 'I feel recognized and valued for the work I do.' },
  { id: 'control', cat: 'Founder control', tf: 'I feel like I still have meaningful control over the direction of this company.', te: 'The founder allows the company to evolve beyond their original vision.' },
  { id: 'speed', cat: 'Execution speed', tf: 'We move fast enough to stay competitive.', te: 'We move fast enough to stay competitive.' },
  { id: 'trust', cat: 'Trust', tf: 'There is genuine trust between me and the leadership team.', te: 'There is genuine trust between me and the leadership team.' },
  { id: 'feedback', cat: 'Feedback loops', tf: 'I regularly get honest feedback - not just what people think I want to hear.', te: 'I feel safe giving honest feedback to leadership without it hurting my standing.' },
  { id: 'future', cat: 'Personal future', tf: 'I see a meaningful role for myself as this company continues to grow.', te: 'Leadership is building something I want to be part of long-term.' },
  { id: 'unsaid', cat: 'The unsaid thing', type: 'open', tf: "What's one thing you wish your team understood about the pressures and decisions you're navigating right now?", te: "What's one thing you wish leadership understood about what it's actually like to work here right now?" },
  { id: 'change', cat: 'The future signal', type: 'open', tf: "What would need to change internally for you to feel like you're leading this company rather than just managing it?", te: "What would need to change for you to feel genuinely energized about where this company is going?" },
];

export const STARTERS: Record<string, string> = {
  vision: 'What does success look like for us in three years - and does everyone in this room see the same picture?',
  decisions: 'When was the last time someone on this team made a call without checking in first - and how did it go?',
  culture: "What's one thing about how we actually work that doesn't match what we say we stand for?",
  info: "What business realities does leadership know that the team probably doesn't - and should?",
  recognition: 'What kind of recognition actually matters to you - and are you getting it?',
  control: "What parts of the company feel like they've grown past what you can hold?",
  speed: "What's one thing slowing us down that we haven't named out loud yet?",
  trust: "Is there something you've been holding back from saying because you weren't sure it was safe to?",
  feedback: "When did you last give feedback that you genuinely weren't sure how it would land?",
  future: 'What would it take for you to still be here - and excited - two years from now?',
  unsaid: "What's the thing that almost never gets said in meetings but everyone knows is true?",
  change: "If you could change one thing about how this company operates tomorrow, what would it be?",
};

export interface SurveyResponse {
  name: string;
  role: 'founder' | 'employee';
  answers: (number | string)[];
  submittedAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  responses: SurveyResponse[];
}
