import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../../lib/questions';

const redis = new Redis({
  url: process.env.scalepassionkv_KV_REST_API_URL!,
  token: process.env.scalepassionkv_KV_REST_API_TOKEN!,
});

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';
function auth(req: NextApiRequest) { return req.headers['x-admin-secret'] === ADMIN_SECRET; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const ids = ((await redis.smembers('company_ids')) as string[]) || [];
    if (!ids.length) return res.json([]);
    const companies = await Promise.all(ids.map(id => redis.get<Company>(`company:${id}`)));
    return res.json(companies.filter(Boolean));
  }
  if (req.method === 'POST') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    const company: Company = { id, name, createdAt: new Date().toISOString(), responses: [] };
    await redis.set(`company:${id}`, company);
    await redis.sadd('company_ids', id);
    return res.json(company);
  }
  if (req.method === 'DELETE') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query as { id: string };
    await redis.del(`company:${id}`);
    await redis.srem('company_ids', id);
    return res.json({ ok: true });
  }
  res.status(405).end();
}
