import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { Company, SurveyResponse } from '../../lib/questions';

const redis = new Redis({
  url: process.env.scalepassionkv_KV_REST_API_URL!,
  token: process.env.scalepassionkv_KV_REST_API_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { companyId, name, role, answers } = req.body;
  if (!companyId || !name || !role || !answers) return res.status(400).json({ error: 'Missing fields' });
  const company = await redis.get<Company>(`company:${companyId}`);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  const response: SurveyResponse = { name, role, answers, submittedAt: new Date().toISOString() };
  company.responses.push(response);
  await redis.set(`company:${companyId}`, company);
  return res.json({ ok: true });
}
