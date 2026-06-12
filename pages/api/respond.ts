import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { Company, SurveyResponse, QUESTIONS } from '../../lib/questions';

const redis = new Redis({
  url: process.env.scalepassionkv_KV_REST_API_URL!,
  token: process.env.scalepassionkv_KV_REST_API_TOKEN!,
});

async function sendNotification(company: Company, response: SurveyResponse) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const founderResp = company.responses.find(r => r.role === 'founder');
  const empResps = company.responses.filter(r => r.role === 'employee');

  const roleLabel = response.role === 'founder' ? 'Founder' : 'Team member';
  const subject = `New survey response — ${company.name}`;

  const rows = QUESTIONS.map((q, i) => `
    <tr>
      <td style="padding:6px 12px;font-size:13px;color:#444;border-bottom:1px solid #f0f0f0">${q.cat}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0">${response.answers[i]}/5</td>
    </tr>`).join('');

  const statsSection = founderResp && empResps.length
    ? `<p style="font-size:14px;color:#555;margin-top:16px">
        <strong>${empResps.length}</strong> team member${empResps.length !== 1 ? 's' : ''} + founder have now responded.
        Head to your <a href="https://scalepassion-drab.vercel.app/admin" style="color:#E8650A">admin dashboard</a> to see the gap analysis.
       </p>`
    : `<p style="font-size:14px;color:#555;margin-top:16px">
        ${response.role === 'founder'
          ? 'Share the survey link with the team to start building the gap analysis.'
          : `${empResps.length} team member${empResps.length !== 1 ? 's' : ''} have responded so far. Still waiting on the founder.`}
       </p>`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="margin-bottom:24px">
        <img src="https://images.squarespace-cdn.com/content/v1/62f53cf782259c2dfb9f5a52/bb7a8b22-4196-4f35-acce-0b301d96fc55/splogo.png?format=400w" alt="ScalePassion" style="height:32px">
      </div>
      <h2 style="font-size:20px;font-weight:500;color:#1a1a18;margin-bottom:4px">New response: ${company.name}</h2>
      <p style="font-size:14px;color:#888;margin-bottom:20px">${roleLabel} · ${response.name} · ${new Date(response.submittedAt).toLocaleString()}</p>
      <table style="width:100%;border-collapse:collapse;background:#f8f8f6;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#1a1a18">
            <th style="padding:8px 12px;font-size:12px;color:#fff;text-align:left;font-weight:500">Category</th>
            <th style="padding:8px 12px;font-size:12px;color:#fff;text-align:center;font-weight:500">Score</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${statsSection}
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#aaa">
        ScalePassion · Radiate Purpose · <a href="https://scalepassion.com" style="color:#aaa">scalepassion.com</a>
      </div>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ScalePassion Survey <survey@scalepassion.com>',
      to: 'ktobe@birdhat.com',
      subject,
      html,
    }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { companyId, name, role, answers } = req.body;
  if (!companyId || !name || !role || !answers) return res.status(400).json({ error: 'Missing fields' });
  const company = await redis.get<Company>(`company:${companyId}`);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  const response: SurveyResponse = { name, role, answers, submittedAt: new Date().toISOString() };
  company.responses.push(response);
  await redis.set(`company:${companyId}`, company);
  try { await sendNotification(company, response); } catch (e) { console.error('Email failed:', e); }
  return res.json({ ok: true });
}
