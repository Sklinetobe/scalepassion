import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../../lib/questions';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';
function auth(req: NextApiRequest) { return req.headers['x-admin-secret'] === ADMIN_SECRET; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const ids = ((await kv.smembers('company_ids')) as string[]) || [];
    if (!ids.length) return res.json([]);
    const companies = await Promise.all(ids.map(id => kv.get<Company>(`company:${id}`)));
    return res.json(companies.filter(Boolean));
  }
  if (req.method === 'POST') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    const company: Company = { id, name, createdAt: new Date().toISOString(), responses: [] };
    await kv.set(`company:${id}`, company);
    await kv.sadd('company_ids', id);
    return res.json(company);
  }
  if (req.method === 'DELETE') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query as { id: string };
    await kv.del(`company:${id}`);
    await kv.srem('company_ids', id);
    return res.json({ ok: true });
  }
  res.status(405).end();
}
