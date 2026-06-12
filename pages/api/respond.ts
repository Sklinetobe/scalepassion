import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { Company, SurveyResponse } from '../../lib/questions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { companyId, name, role, answers } = req.body;
  if (!companyId || !name || !role || !answers) return res.status(400).json({ error: 'Missing fields' });
  const company = await kv.get<Company>(`company:${companyId}`);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  const response: SurveyResponse = { name, role, answers, submittedAt: new Date().toISOString() };
  company.responses.push(response);
  await kv.set(`company:${companyId}`, company);
  return res.json({ ok: true });
}
