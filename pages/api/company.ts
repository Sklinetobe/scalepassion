import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { Company } from '../../lib/questions';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';
function auth(req: NextApiRequest) { return req.headers['x-admin-secret'] === ADMIN_SECRET; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'ID required' });
  if (req.method === 'GET') {
    if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const company = await kv.get<Company>(`company:${id}`);
    if (!company) return res.status(404).json({ error: 'Not found' });
    return res.json(company);
  }
  res.status(405).end();
}
