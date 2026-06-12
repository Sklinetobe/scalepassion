import { useState, useEffect, useCallback } from 'react';
import { Company, QUESTIONS, STARTERS } from '../../lib/questions';

const orange = '#E8650A';
const dark = '#1a1a18';
const bg = '#f8f8f6';

function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function GapBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#999', width: 68, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: '#eee', borderRadius: 99, height: 8 }}>
        <div style={{ height: 8, borderRadius: 99, background: color, width: `${Math.round((value / 5) * 100)}%` }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#666', width: 28, textAlign: 'right' }}>{value.toFixed(1)}</span>
    </div>
  );
}

function CompanyDetail({ company, onBack, secret }: { company: Company; onBack: () => void; secret: string }) {
  const founder = company.responses.find(r => r.role === 'founder');
  const employees = company.responses.filter(r => r.role === 'employee');
  const [tab, setTab] = useState<'gaps' | 'responses' | 'starters'>('gaps');
  const [copied, setCopied] = useState(false);
  const surveyUrl = typeof window !== 'undefined' ? `${window.location.origin}/survey/${company.id}` : '';

  const gaps = QUESTIONS.map((q, i) => {
    const fv = founder ? founder.answers[i] : null;
    const empAvg = employees.length ? avg(employees.map(e => e.answers[i])) : null;
    const gap = fv !== null && empAvg !== null ? Math.abs(fv - empAvg) : null;
    return { q, fv, empAvg, gap };
  });

  const overallGap = gaps.filter(g => g.gap !== null).reduce((s, g) => s + (g.gap ?? 0), 0) / (gaps.filter(g => g.gap !== null).length || 1);

  function badgeStyle(gap: number | null) {
    if (gap === null) return { background: '#f0f0f0', color: '#999' };
    if (gap >= 2) return { background: '#FCEBEB', color: '#A32D2D' };
    if (gap >= 1) return { background: '#FAEEDA', color: '#854F0B' };
    return { background: '#EAF3DE', color: '#3B6D11' };
  }

  const sortedStarters = [...gaps].filter(g => g.gap !== null).sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)).map(g => g.q.id);

  function copyLink() {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: orange, fontSize: 14, marginBottom: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        &larr; All companies
      </button>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: dark, marginBottom: 4 }}>{company.name}</h2>
      <p style={{ fontSize: 13, color: '#aaa', marginBottom: '1.5rem' }}>Created {new Date(company.createdAt).toLocaleDateString()}</p>

      <div style={{ background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '14px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, color: '#aaa', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Survey link</p>
          <p style={{ fontSize: 13, color: orange, wordBreak: 'break-all' }}>{surveyUrl}</p>
        </div>
        <button onClick={copyLink} style={{ flexShrink: 0, background: copied ? '#EAF3DE' : '#FEF0E6', color: copied ? '#3B6D11' : orange, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.5rem' }}>
        {[
          { label: 'Founder response', val: founder ? 'Yes' : 'Pending' },
          { label: 'Team responses', val: employees.length },
          { label: 'Avg gap score', val: founder && employees.length ? overallGap.toFixed(1) : '—' },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: '#f4f4f1', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: dark }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e4', marginBottom: '1.5rem' }}>
        {(['gaps', 'responses', 'starters'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize: 14, padding: '8px 18px', border: 'none', background: 'transparent', color: tab === t ? orange : '#999', borderBottom: tab === t ? `2px solid ${orange}` : '2px solid transparent', marginBottom: -1, cursor: 'pointer', fontWeight: tab === t ? 600 : 400 }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'gaps' && (
        <div>
          {!founder && !employees.length && <p style={{ color: '#aaa', fontSize: 14 }}>No responses yet.</p>}
          {gaps.map(({ q, fv, empAvg, gap }, i) => (
            <div key={q.id} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: dark }}>{q.cat}</span>
                <span style={{ fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 99, ...badgeStyle(gap) }}>
                  {gap === null ? '—' : gap < 0.5 ? 'Aligned' : `Gap: ${gap.toFixed(1)}`}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {fv !== null && <GapBar label="Founder" value={fv} color={orange} />}
                {empAvg !== null && <GapBar label="Team avg" value={empAvg} color="#B4B2A9" />}
              </div>
              {i < QUESTIONS.length - 1 && <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '12px 0 0' }} />}
            </div>
          ))}
        </div>
      )}

      {tab === 'responses' && (
        <div>
          {!company.responses.length && <p style={{ color: '#aaa', fontSize: 14 }}>No responses yet.</p>}
          {company.responses.map((r, i) => (
            <div key={i} style={{ background: '#f4f4f1', borderRadius: 8, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: dark }}>{r.name}</span>
                {r.role === 'founder' && <span style={{ fontSize: 11, background: '#FEF0E6', color: orange, padding: '2px 6px', borderRadius: 99, fontWeight: 600 }}>Founder</span>}
              </div>
              <span style={{ fontSize: 12, color: '#aaa' }}>{new Date(r.submittedAt).toLocaleString()}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: '#ccc', marginTop: 8 }}>Individual answers are not displayed — only aggregates are used in the gap analysis.</p>
        </div>
      )}

      {tab === 'starters' && (
        <div>
          <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, marginBottom: 14 }}>
            {founder && employees.length ? 'Ranked by widest gap.' : 'All starters shown — gaps will be ranked once both sides respond.'}
          </p>
          {sortedStarters.concat(QUESTIONS.map(q => q.id).filter(id => !sortedStarters.includes(id))).slice(0, 5).map(id => (
            <div key={id} style={{ background: '#f4f4f1', borderRadius: 8, padding: '12px 14px', marginBottom: 8, fontSize: 13, color: dark, lineHeight: 1.6, borderLeft: `3px solid ${orange}` }}>
              "{STARTERS[id]}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState('');
  const [secretErr, setSecretErr] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCompanies = useCallback(async () => {
    const res = await fetch('/api/companies', { headers: { 'x-admin-secret': secret } });
    if (res.ok) setCompanies(await res.json());
  }, [secret]);

  useEffect(() => { if (authed) fetchCompanies(); }, [authed, fetchCompanies]);

  async function login() {
    const res = await fetch('/api/companies', { headers: { 'x-admin-secret': secret } });
    if (res.ok) { setAuthed(true); setCompanies(await res.json()); }
    else setSecretErr(true);
  }

  async function createCompany() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) { setNewName(''); await fetchCompanies(); }
    setCreating(false);
  }

  async function deleteCompany(id: string) {
    if (!confirm('Delete this company and all its responses?')) return;
    await fetch(`/api/companies?id=${id}`, { method: 'DELETE', headers: { 'x-admin-secret': secret } });
    if (selected?.id === id) setSelected(null);
    await fetchCompanies();
  }

  async function selectCompany(c: Company) {
    const res = await fetch(`/api/company?id=${c.id}`, { headers: { 'x-admin-secret': secret } });
    if (res.ok) setSelected(await res.json());
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e4', background: '#fff' }}>
        <img src="https://images.squarespace-cdn.com/content/v1/62f53cf782259c2dfb9f5a52/bb7a8b22-4196-4f35-acce-0b301d96fc55/splogo.png?format=400w" alt="ScalePassion" style={{ height: 28 }} />
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ width: 40, height: 4, background: orange, borderRadius: 99, marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: 24, fontWeight: 600, color: dark, marginBottom: 8 }}>Admin dashboard</h1>
          <p style={{ fontSize: 14, color: '#777', marginBottom: '1.5rem' }}>Enter your admin secret to continue.</p>
          {secretErr && <p style={{ fontSize: 13, color: '#c0392b', marginBottom: 10 }}>Incorrect secret.</p>}
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Admin secret"
            style={{ width: '100%', padding: '12px 14px', fontSize: 15, border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', color: dark, marginBottom: '1rem', outline: 'none' }} />
          <button onClick={login} style={{ width: '100%', background: orange, color: '#fff', border: 'none', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Sign in</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e4', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="https://images.squarespace-cdn.com/content/v1/62f53cf782259c2dfb9f5a52/bb7a8b22-4196-4f35-acce-0b301d96fc55/splogo.png?format=400w" alt="ScalePassion" style={{ height: 28 }} />
        <span style={{ fontSize: 12, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin</span>
      </header>
      <div style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {selected ? (
            <CompanyDetail company={selected} onBack={() => setSelected(null)} secret={secret} />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: dark }}>Companies</h1>
                <span style={{ fontSize: 13, color: '#aaa' }}>{companies.length} total</span>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '14px 16px', marginBottom: '1.5rem', display: 'flex', gap: 10 }}>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCompany()}
                  placeholder="Company name"
                  style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: '1.5px solid #eee', borderRadius: 8, background: bg, color: dark, outline: 'none' }} />
                <button onClick={createCompany} disabled={creating || !newName.trim()}
                  style={{ background: newName.trim() ? orange : '#ddd', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'default' }}>
                  {creating ? 'Adding...' : '+ Add'}
                </button>
              </div>
              {!companies.length && (
                <div style={{ background: '#f4f4f1', borderRadius: 12, padding: '2.5rem', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                  No companies yet. Add one above to generate its survey link.
                </div>
              )}
              {companies.map(c => {
                const founder = c.responses?.find(r => r.role === 'founder');
                const empCount = c.responses?.filter(r => r.role === 'employee').length ?? 0;
                return (
                  <div key={c.id} onClick={() => selectCompany(c)}
                    style={{ background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = orange)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e4')}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: dark, marginBottom: 4 }}>{c.name}</p>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#aaa' }}>
                        <span style={{ color: founder ? '#3B6D11' : '#ccc' }}>{founder ? '✓ Founder responded' : 'Founder pending'}</span>
                        <span>·</span>
                        <span>{empCount} team {empCount === 1 ? 'response' : 'responses'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: orange, fontWeight: 500 }}>View →</span>
                      <button onClick={e => { e.stopPropagation(); deleteCompany(c.id); }}
                        style={{ background: 'transparent', border: '1px solid #eee', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#ccc', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <footer style={{ padding: '16px 24px', borderTop: '1px solid #e8e8e4', background: '#fff', textAlign: 'center', fontSize: 12, color: '#ccc' }}>
        © ScalePassion 2026 · <a href="https://scalepassion.com" style={{ color: '#ccc' }}>scalepassion.com</a>
      </footer>
    </div>
  );
}
