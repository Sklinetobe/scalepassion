import { useState, useEffect, useCallback } from 'react';
import { Company, QUESTIONS, STARTERS } from '../../lib/questions';

const orange = '#E8650A';
const dark = '#1a1a18';
const bg = '#f8f8f6';

function avg(arr: (number | string)[]) { const nums = arr.filter(v => typeof v === "number") as number[]; return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }

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
    const fv = founder && typeof founder.answers[i] === "number" ? founder.answers[i] as number : null;
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
          {gaps.filter(g => g.q.type !== 'open').map(({ q, fv, empAvg, gap }, i) => (
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
            <div key={i} style={{ background: '#f4f4f1', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: dark }}>{r.name}</span>
                  {r.role === 'founder' && <span style={{ fontSize: 11, background: '#FEF0E6', color: orange, padding: '2px 6px', borderRadius: 99, fontWeight: 600 }}>Founder</span>}
                </div>
                <span style={{ fontSize: 12, color: '#aaa' }}>{new Date(r.submittedAt).toLocaleString()}</span>
              </div>
              {QUESTIONS.filter(q => q.type === 'open').map((q, qi) => {
                const qIndex = QUESTIONS.indexOf(q);
                const val = r.answers[qIndex];
                if (!val) return null;
                return (
                  <div key={qi} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e4' }}>
                    <p style={{ fontSize: 11, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.cat}</p>
                    <p style={{ fontSize: 13, color: dark, lineHeight: 1.6, fontStyle: 'italic' }}>"{val}"</p>
                  </div>
                );
              })}
            </div>
          ))}
          <p style={{ fontSize: 12, color: '#ccc', marginTop: 8 }}>Scale question scores are not shown individually — only aggregates are used in the gap analysis.</p>
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
        <img src="data:image/png;base64,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" alt="ScalePassion" style={{ height: 28 }} />
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
        <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAB5AlQDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAcIBQYJBAMCAf/EAFcQAAEDAwEFAwYHDAcFBAsAAAECAwQABREGBwgSITFBUWETFCI3cYEVMnWRobO0CSM2QlJidHaisbLBFjM4coSS0RcYJFWCZ5Ol4zRDVmNzlJXC0uHw/8QAGwEBAQEBAQEBAQAAAAAAAAAAAAMCBAEFBgf/xAAtEQACAgEDAwMEAQQDAAAAAAAAAQIDEQQhMRITMgVBUSIjYXEzscHh8BSh0f/aAAwDAQACEQMRAD8AuXSlKAVhNWX5uzxOFvhXLcH3tB7Pzj4fvr0aivDFngl5zCnVcmm881H/AEqK58t+dLclSXCt1w5J/kPCu/RaTuvqlx/U+frdX2l0R8v6GyaQ1O7FlGNcnlOMPKJ8os5Laj2+w/RUhggjI5ioRrdNC6j8mUWqe56HRhxR6fmn+XzV067R5Xcgv2c2h1mH25v9G9UpSvjn2RSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAV47xcY1rgrlSVYSOSUjqs9gFeyo02hSJLmoXGHXCWmkp8knsAKQSfbnNdOloV1nS+Dm1d7or6lyYi83KRdZy5clXM8kpHRCewCvHSto0xpNy5MJlzXFsR1fECR6ax38+gr70510Qy9kfn4V2Xzwt2avSpAnaFgqZPmcl9t0Dl5QhST7cAGtFnRX4UtyLJQUOtnChXlOpru8Wau01lPkje9D6j87Qm2znP8AiEjDTij/AFg7j4/vrbahJClIWlaFFKknIIOCDUwWJ15+zQ35CuJ1xlK1HGM5Ga+Vr9PGt9cfc+r6fqZWLol7HtpSlfOPpClKUApSlAKUpQClKUApSlAKUpQClKUApSlAK1fafrmybPNJvajvxfMdCw000yjiW84QSlA7BnB5kgcq2ioG36PUqz8sMfwO1qKy0jM3iLZIWw/W0naHs9jaqlQWYKpUh9KGG1FQQhDikpBUepwBk4GT2Ct3qHNzT1A2b9IlfXLqY6SWJMQeYpilKVk0KUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQCvxIeZjx3JEh1DLLSStxxaglKEgZJJPIADtr91qu1jRrevtB3HS7lxlW7zpI4H2FEYUDkBQ/HRnqk9fA4I9R4+NiCtQ711uh7T2YVttwmaQZJZlSwD5d1RI+/NjpwpxySeagT05YsnY7rbr3aIt2tMxmbBlNhxh9pWUrSf8A+6dQeRrmnqrZ/qvTmuToydaX13dbobjtMpKxJCjhK2z+Mk9/ZzBwQQLz7tWza47NdCG33a6PSp01wSH4wc4mIisfEb8fyldCQMdMmtkIpJojVOTbTJRpSlRLilKUApSlAKUpQClKUApSlAKUpQCo52lNcF+bcHRxhJ94JH+lSNWjbUmsOQHh2haT7sEfvNdvp8sXr8nF6hHND/BpaAkrSFHCc8z4VNbSENtpQ2AlCQAkDoB2VCdb3pXVsZMRuHdFqbW2OFL2MhQHTOOhrv8AUaZ2RTjvg+f6ddCuTUtsm51H205DYusZaQAtTPpeIBOP51s03VNljMlYlpfVjkhoZJ/kPfUc3y5PXW4uTHgE55ISOiUjoK5vT6LFZ1tYR0+oX1uvoTyzxVNEFryMJhnGPJtpT8wxUPW5ry9wjM9fKOpT85AqZ636pLxX7MelR8n+hSlK+SfXFfKZKjQojsuZIZjR2UlbrrqwhCEjqSTyA8TX1qoe/Dq273LWFo2b2pbxj+TbffYbOPOX3FkNoPeEgAjsyvwGNQj1PBmculZJc1BvJ7JrTIcjovki5ON8leYxFrTnuClAJPtBI8ax0Hem2VSHOF5+8wxn4z0EkfsFRrDaF3UNFwbUwvVkyfdrkpIL6GXvIx0K7UpCRxEDpknn3CthmbsGyV9koatdxiq/LauDhV+0SPorf2yf3SRtC660lrmI9K0pfI1zbY4fLBsKStrizw8SFAKTnhVjI7D3VsdRpsS2P2rZTMvy7Pd5s6LdvN8NykJ42fJeU/HTgKz5T8kYx255SXU5YzsVjnG4rD6s1TpzSdu+ENSXmFa45yEqkOhJWR1CU9VHn0AJrAbbdoUHZroOVqCQhD8tR8hAjKOPLPqB4QfzRgqPgD24qomzvZ5r3eC1RK1PqG7vMW1LnC9cHkFQ7/Ix0chyz0GEpzzyTg7jDKy+DE54eFyWFue9FsohulDE263AA4448FQB8fvhSfor26d3ktk94lIjKvj9scXjhM+KptGe4rGUj2kgeNeSw7sGye3x0tzrbcLw4B6Tkqc4gk9+GigCvhqPda2XXJhabYxc7I6R6C48xTqQfEO8WR7x7a9+3+Tz7n4JsgS4k+G1NgymJUV5IW08y4FoWk9ClQ5EeIr7VrGyrSh0PoC16VM0Tvg9K0CR5Pg8oC4pQPDk4OFd5rZ6kyi4NA1Ztn2Y6XeWxddX28yEHCmYpVJWk9xDYVwn24rSpO9TssZc4WzfJA/KbhAD9pQNa1o/dE05GbQ7qrUlwuL2MqahJSw0D3EqClKHiOGt2b3Z9kCWihWn5S1YHpquL+eXsVjn7Kr9tE82MyOld4DZTqGUiIxqZEGQs4SieyuOD/1qHB+1UpJIUkKSQQRkEdtVo2l7qGm5Fmky9DTJ0G5toUtqJJeDrDxHPgyRxJJ6Akkd47a8G5BtDukp+4bOb4+66YTJkW4vH02kpUEuM8+eAVJIHZhXZgA4RazEKck8SLTVA2/R6lWflhj+B2p5qBt+j1Ks/LDH8DtZr8kas8WZbc09QNm/SJX1y6mOoc3NPUDZv0iV9cupjryfkz2HihWH1ZqnTmk7d8IakvMK1xicJVIdCSs9yU9VHwAJr8a81LA0do+6amuZPmtvYLqkg4K1dEoHipRSkeJFUw0Do7WG8hru46l1FdnYlpjucLrwBUlkHmmOwknAwOp7M5OSrn7CGd3wZnPGy5J7uW9JsoivFDEu7z0g4448AhJ8fvhSforYNHbfNluqJrcGHqREOW4cIantKj8R7gtQ4M+HFk1ibTuybIoUcNSbJNuawMeVlXB5Kj4/elIH0VqO0vdS0xNtT0nQsqVa7k2gqaiyHi7HeIHxeJXpIJ/KyR4Vr7b2M5sW5ZOlVg3NtpV4duMzZdqtx9UyAlZgKkEl1vyZ4XI6s8/R6pHYAodAALP1iUel4KRkpLJrG0zXendnmm/h7Ur7zUVTwYaSyyXFuulKlBCQOQOEKOSQOXWos2PbwLm0raqdNwrG3bbQITryHH3CuQ6tJTjp6KRgqJHpdBzry7+/qftP6wM/Z5FU40tqO9aYnvT7DOcgy3Y7kYvt8lpQsYVwn8U47RzHZiqwrUo5I2WOMsHQ3X22PZzoiUuFfdSMCej40SMlT7qT3KCAQg+CiK0tjen2VOSS0t29MoBx5VcHKTz68lE/RVTND7I9o+uY3wjYtOSpERwlQmSFpZbc7ylThHHz5ejnn76yWp9gm1bT1tcuMzSrz8ZscTiob7chSR3lCFFWPEDAr1VwWzZ47ZvdIvbobX2jtbx1PaW1BDuPAMraSSh1A71NqAWB4kVs1crLDeLpYbvHu9mnvwJ8ZfGy+yvhUk/zB6EHkRyNdD93vaMjaXs8j3l5CGrnGX5rcWkckh1IB4kjsSoEKHdkjnisWV9O6N129WzJErGai1BYtOQvPb/eIFrj9A5LfS0FHuHEeZ8BWTqou/TabpedeaXh2i2zLjJVb3cMxWFOrP3z8lIJrEI9TwbnLpWSW7xvJ7I7e8WkagfnKBwrzWE6pI/6lJAPuJrFxN6fZW87wOOXqMMgcbsHI9voqJ+iqw2nd+2vXJtLjOjZDKFY5yZLLJGe9K1hX0V+7vu9bXrayt9zSDshtIyTFlMvKPsQlZUfcKv26/kj3LPgvHoXaPojW6SNMajhT3QniVHyW30jtJbWArHjjFbXXKpl26WK8JdaXLttyhO5BHE08w4k+4pUDXQLdj2jvbR9nKJVyUk3m3OeaTyBjypABS7gdOIdfzgrGBip2VdO6N129WzJTrx3m62yy25243e4RbfDaGXH5LqW0J9pJxXsrnpvObR7jrvaNcIwkuCx2qQuNAjhXoHgJSp0jtUognPUJwOyswh1s1ZPoRai87y2yS3PKaavcq4KTnJiQnCnI7AVBIPtHKvJA3o9lElQD0u7QgTgl+AogePoFVUv0foPWWr0rXprTdxubTa+BbzLJ8klX5JWcJB5jlmtkmbCtrcVkvO6HuKkjsaU24r/ACpUT9FW7UF7ke7N74L56J2gaL1qFf0X1HBuTiEeUWy2vheSnIHEW1ALAyQMkdtbPVLtyC1XSz7bbvCu9tmW6UnT73EzKYU0sf8AER+qVAGro1GcVF4ReuTkss89znwbZBdn3KZHhRGU8Tr77gbQgd5UeQqKL1vJbJLY+phF/fnrScKMSG4pI9iiAD7QTVZd7TaRctX7R7hp9mUtNiskhUZiOg4S48j0XHVflHi4gO4Dl1OY20jorVmrnHE6a09cboGjhxcdklCD3KX8UHwJqsaVjMiUrnnES6UHel2UyFAPSbxEBOMvQScePoFXKpE0TtI0LrRzyOmdTQLg/wAPH5uFFt7h7T5NYC8DtOOVUSl7CdrcZkvOaIuCkjqGltuK/wAqVEn5q3TdAs13se8BGh3q1TrbJFvknyUuOppfQdigDXkq44ymI2zyk0XlpSqD75mqDqDbRLgNL4otkYRBRg8iv47h9vErhP8AcFThDqeCs59CyXufttvfuUa5vQYzs6KlaI8hbQLjSV44glXUA4Gcda9Vcnqv9uaeoGzfpEr65danX0rOTFdvW8YJjpSqeb3+2e4Sb3L2eaYmrjQYh8ldJDKilb7v4zII6IT0UO05B5DniEXJ4RSc1FZZPmsNuOy/S0pyJcdVRnpbZIUxCQqSpJHUEoBSk+BIrVE702yovlsvXlKQMhwwfRP7WfoqjNst8+6TW4NthSZspw4bYjtKccV7EpBJrandk+01tgvL0FqMISOI4t7hOPZjNX7MVyzn703wi+uiNrmzrWclESwaphvTF8kxXgph1R7kpcCSo/3c1vNco32pEOUtl9p2PIZXwqQtJQtCgehB5giribnu2afqRw6C1VLVJuLLJctsx1WXJCE81NrJ+MtI5g9SAc8xk4nVhZRuu7qeGWYrUtqG0TTGziytXTU0l9tD6y3HaYZLjjywMlKewcu1RA8a22qyfdAfwP0x8oO/V1OCzLBScumLaNg2Qbwi9pG1YaZg6fTb7SYbrqHXnOOQtaOEgnGEoGM8vS5451KGuto2idDoH9J9RQ4DqhxJYJLjyh3htAKseOMVzk0Vqu+aNvCrxp2Z5nOVHcjh7gCilKxgkZ6HuPZWf0js22k7RnnLrabHcbol9wqduEpwIQ4rPpEuuEBZz1wSavKpZzwiEbpYxyy2696XZSl/yYk3haef3wQTw/Sc/RW/aB2oaD10ss6Z1FFlyQOIxVhTT2B1IQsBRA7wCKpDqLd/2sWO3LuEnSzkhhsFTnmkhp9aQBnPAlRUfcDUbWydMtlxj3G3SnYsuO4HGXmlFKkKByCDTtRa2Y700/qR1ZpWkbCtaK1/svtGo3+ATXGyzNSgYAfQSlRx2BWAoDsChSudrDwdKeVk3R91phlTzziW20DKlKOABUca1v7N3cbjxWz5BlRIcVyKj7OwV59X3efOuT0WQrybLDqkJaSeWQcZPeawdfa0eiVeJy5PiazWuzNceBSlK+kfNFKUoD7QJKoc1iUlCVqZcCwlXQkHNSpYL5DvDHEwrgeSPTZUfST/AKjxqJa+kZ96M+h9hxTbiDlKknBFcuq0sb1+Tq0uqlQ/lE1UrE6TuEm52VuVKQkOFRTlPIKxyzjsrLV+enBwk4v2P0UJqcVJe4qkm9sh7TO8lbNTPx3FxlohTkY6L8isJUkeP3vp4g9tXbrSdr+zPTu03TybXe0LafYJXDmM48rHWeuM9UnAyk8jgdCAR7XLpe55ZFyWxsOlNRWXVVij3uwXBmdBkJBQ42rODjJSodUqGeaTzFZWqQXvYxto2T3Fy8aJuEu4xk8y/aFqDikjoHI5yVewBYrOaD3rtR2mULbtBsKZyW1cDsiKjyElBB58TZ9BR8BwVp1Z3i8mFbjaSwXDpWu6A1rprXdjTeNM3JubHzwuJ+K4yr8laTzSfb16jIrYqk1gsnkprv0XiXeNpWn9HRCVpixUuJbB+M++vhwf+lCMf3jVsNC6cg6R0ha9N21ATHgR0sggY41Aeks+KlZUfE1UbbYkP77FlZdyts3W0IKSfxSWcj6TV06rPaKRKveUmKUpUiopSsPrTUtn0hpmbqK+yRHgQ0cbisZUo9AlI7VE4AHeaDgzFKp1e95zaNqi8uW/Z3pRDbeT5JCYi5stSc8lEJ9EezhOM9TX5Tr3euKQRYLvgjPOwIH/ANlU7T9yXej7Fx6pZsrSLdvzT4cX0GXbtdEqT3JLTy8DHYCB81ez+nm9d/yC7f8A0BH/AOFaru8Sb3N3t7bL1K041eXpU9c5C2g2pLpiv8QKRjhOeytxh0pmJTUmv2XxqBt+j1Ks/LDH8DtTzUDb9HqVZ+WGP4HanX5IrZ4sy25p6gbN+kSvrl1MdQ5uaeoGzfpEr65dTHXk/JnsPFFb9/e+OQ9n1ksTa+H4SuCnXAD8ZDKOns4nEH3CpH3Y9Psae2H6aYabSlybETcHlDqtT33wE+xJSn2JFQf90HcWblo1kq9BLMxQGOhJZB/cK8+md7X4F03a7N/s/wDL+YQ2o3lfhjh4+BATxY8gcZxnGTVeluCwS61GxtlwaVU7/fI/7Of/ABv/AMin++R/2c/+N/8AkVjtT+Dfeh8mG1+2nS2/LaZdvAR8IXKEpSU8sGQlLLnz8Sif7xq5VUBf1/8A7St5rSGqPgn4K8peLYz5v5x5bHA+gZ4uFPX2Vf6vbVjGTNTTzgr3v7+p+0/rAz9nkVVbYXabdfNr2mLVdoqJcGRPQl5lfxXAMnB7xy6dtWp39/U/af1gZ+zyKrJu3evTSPygn+E1WvwJWfyHR1lttlpDLLaW20JCUISMBIHIADsFfqlK5TrKF75uj4el9rZm21hLES9RhNKEDCUvcSkuYHiQFe1ZratwK8uMa21FYCrDUy3IlAE/jNOBPLxw8fm8K933QYD4Z0gcc/N5X8TdanuL+up75Hf/AI2q6uajk4t2L0UwOIqwMkYJpVRd4XeTu7V+l6Y2eSW4kaIssybqEBa3ljkpLWcgIByOLBJIyCBgnnjFyeEdM5qKyy3VK5fXLXGtLk8Xrhq2/Slk5y7cHVY9mVcq8v8ASbUn/tBdv/nHP9ar2H8kf+QvgnLfxs0SDtNtd2jNJbduVtBkcIxxrbWUhR8eEpHsSKzX3PuW6m/6sgA/enYsd4j85K1gfQs1Wa4XG4XFaV3CdKlqQMJU+6pZSO4ZPKrI/c/vww1P8ntfWVSaxXgnCWbMlx65XamjPQ9SXOJIQUPMTHW3EnsUlZBHziuqNVY3nd3q6Xq+y9a6FYbkPyj5SfbQQla3PxnWyeRJ6lPI5yRknFSpkk9y10XJZRnt0XadogbNrXo2VdIdqvUIuJUzJUGhI4nFKCkKOAokKAxni5dMVYmuU9zgTrXOdg3KFIhS2jwuMSGi2tB7ik8xW67PtsW0PQ5aasuoZDkFvAEGWfLx8fkhKuaB/cKTW5053ROF2Fho6QltBdS6UJLiQUpVjmAcZGe44HzCv1UL7Atvll2kvJsdxjJtGowgqEfjy1JAGVFonnkAElB5gdCrBImiudpp4Z0xkpLKOX20uNIh7RdSxZRUX2rtKQ4VdSQ6rJ9/WrT7m+03RULZ9H0ZcrlEtN3YlOqAkqDaZQWoqCgs+iVAYTgnPojGa/e9HsBuGq7u7rXRTbblzdQPP7epQR5wUgAONk8uPAAIOM4yOec1AvFruVnuDlvu1vlQJjRw4xJaU2tPtSoA11bWRwcn1VSydVkkKSFJIIIyCO2vyptClpWpCVKRkpJHNPZy7q5r6A2s6/0OptFh1HKREQf/AEKQfLR8dwQrIT7U4PjVt9gm8PZ9oM1rT98iN2bUDg+9JSomPLIGSEE80q5fFUT4EnlUZVOO5eF0ZbE515nLfAcWpbkGMtajkqU0kkn5q9NKkVOZG2NKUbXdZIQkJSm/zglIGAB5wvlV1NzT1A2b9IlfXLqlu2b1wa0/WCd9oXV0tzT1A2b9IlfXLrpt8EctPmyTtY3dGn9JXi+uAFNugvSiD2+TQVY+iuXEyQ/MlvS5LqnX33FOOrV1UpRySfaTXR3eMdW1sN1eptWCbatJ5dhwD9BNc3aULZsah7pHQvdg2e27RGzK2SfNGxerrHRLnyCgeU9MBSWs9QlIIGOmeI9tStXzisNxorUZoYbaQEJHgBgV9K528vJ0xWFgr9vqbPrdetnj2s4kRtF4s6kKddQgBT8dSglSVHt4chQJ6AK76p1oC/vaW1tZtRMKKV2+a2+cfjJChxJ9hTke+ui225lD+xvWaHBkCxTFj2pZWofSBXM6uml5jhnLesSyjrAlSVpCkqCkkZBByCKrL90B/A/THyg79XVh9IuLe0paHXFcS1wWVKPeS2nNV4+6A/gfpj5Qd+rqNfmi9vgyvm7bp+06p22adsl8iiXb3nHnHWVHCXPJsOOJB7xxIGR2jIro1GYZjR248ZltllpIQ222kJShI5AADkAO6ufW6F/aI0v/AIv7I9XQmtX+RijxFc4d5Ozx7Dty1Vb4raWmfOxIShPIJ8s2l0gDsGVnl2V0erntve/2iNUf4T7IzSjyF/iTFuZX2fb9ltwjsFtTfwy6ocYJxllnkOfT/U0rF7o3q3uHyw79SzSvJr6mIN9KJq13H831LIIGEuhLg945/SDWCrc9qMfEiFKA+MhTZPsOR+81piQVEAAknkAO2v0Gkn1UxZ8DVw6LpIUrYJelLhGsguC+bg9JxgD0kI7/AG94rX6pCyNizF5JWVTreJLApSslp60P3ieI7WUNp5uuYyED/XuFalJQTlLgzCLm1GPJjaV7r5apVpmmNJTkdULHRY7x/pXngsGTNYjDq64lA95xRTi49Sex64SUulrclfTMfzWwQmcYIZCiPE8z9JrI1/EgJSEgYAGAK/tflpy6pN/J+qhHpior2FKVi7lqOwW26sWq43q3wp0lBcYYkSEtrdSDglIURxc+6smjKVp+0XZpovX0NbOpLJHffKcImNjyclruKXBz5dxyO8GtwBBGQcivNdLhAtUB2fc5seFEZTxOPPuBCEDvJPIV6m1weNJ8lH9l6bpsd3qW9IpnKeivT27a/wBgkMvhJZUodihxtq8DkdCc3pqi0O5N7Tt8uFebIlxyEbzHkNLAOCzESj0+fQKDOef5WOtXpqlvsSp4eOClO9nx6X3mLNqZSVBstwbgFJzzLLhSR7fvY6d4q6jLjbzSHWlpW2tIUlSTkKB6EVAe+toCRqjQUbUtsYU9PsClrdQgekuMsDynt4SlKvZxVjt1bbjZLnpiBovVdxZt94gNpjxH5CwhuW0kYQOI8g4BhOD8bAIySQPWuqCa9hF9M2n7lj6USQpIUkggjII7a+E+ZEgRVy50piLHbGVuvOBCEjvJPIVEsfeqqfdAL/JbjaZ0w04pMd5T02QkdFlOEN/NxOfOKs9ZLrbb3bGbpaJrE6C9xeSkMq4kL4VFJKT2jIPMVV/7oBYJS2dMamabUuM15aFIUByQpXCtv58OfMKpV5rJK3weCc9hOirbobZrabZCittynozb894Jwt59SQVFR6kAnAB6AAVvVR3sE2i2TXuhLa7EnMG7RoqGrhDKx5VpxKQlSuHrwE8wrpzx1BFSJWJZzubjjGwqluz7+3lJ+WLn9nfqwO2bbbpHZ3bX2vPWLpfuEhi2x3ApQX2F0j+rT068z2A1Vrdsutxvu9XZ73dsefXB+bKfwjgHEuK8rkOwc+Xhiq1xeGyVkk5JfkvtUDb9HqVZ+WGP4HanmoL34o7j2xAuIHosXSO4v2YWn96hWIeSKWeLMjuaeoGzfpEr65dTHUKblcyNJ2EwI7LqVuxJklt5IPNCi4VgH/pUDU115PyYh4oq390Fty3LHpK7pT6EeTJjLOO1xKFJ+qV9NTTsSNpvWyHSdxRDhuFdpjocUGU/1iEBC/2kqFfLeD0OvaBssudijISq4IAlQMnH39vJAz2cQKkZ/Oqv26Rtit+kmHtnetXzbWESVqhSZHoojrJ9NlzPxBxZIJ5AlWccq2l1Q29jD+mzf3LbfBlt/wCXxP8AuU/6U+DLb/y+J/3Kf9K+8WQxLjNyYr7T7DiQptxtYUlQPaCORFfSpFjzIt1vQtK0QYqVJOUqDSQQe/pXprGQNQ2KfeJFngXiDKuEVAckR2X0rW0knAKgD6PvrJ0BXvf39T9p/WBn7PIqsm7d69NI/KCf4TVm9/f1P2n9YGfs8iqY6cvNx09fYV7tEgx58J0PMO8IPCoeB5EeBrqqWYHJa8TydUqVV/Q291ZXIDbOs9PTo01IAU/bQl1pw9/CtSSj2Aqr+683uLGi1PMaLsVwfuC0lLci4JQ200SPjcKVKK8dx4fbUe1LOMF+7DGckfb9WoGbntWh2WO5xiz29KHhn4rrhKyP8nk69m4Pa1yNpN7u5QSzDtRZz3LddQU/Q2uq+Xe4zrvdZV0uUlcqbLdU8+8v4y1qOST7zV8d0TZ/J0Psz87ukcsXa9uCW+2oYW00BhptQ7CASojqCsg9KtP6YYIQ+uzJv21u6SbJsu1RdoaimTFtUhxlQ/FWG1cJ9xwfdXM+0w1XG6xLehYQqS+hlKiOSSpQGfprp1tEsi9S6Cv2n2lBDtxtz8ZpRPILUghJPhkiuYq0zbVdFIWl2LNhvYUkjhW04hXTwII+ivKOGav5R040Jo3TuirFHtGn7bHitNNpQt1LYDj5A5rcUBlSj1JNbBVd9C712iZ1ojp1ZGn2m5pQBIU0wXo6ldqkFJKgD1wRyzjJ61+NZ72ejIMNxGl7XcbxNIIbU+gMMA9hJJKj7An3io9ubfBVWQS5ND+6A/hhpj5Pd+sp9z+/DDU/ye19ZUC7QdY3/Xepn9Q6iliRLdwlKUp4W2UD4qEJ7EjPt6kkkk1PX3P78MNT/J7X1lXkumvBzxl1WZLj0pVQL3vO6y0ltH1NY59stt6tsG8S48cKBYeQ2h5aUp405SQAAMlJPeTXPGDlwdUpqPJaHV+jdK6viebalsEC6ICeFKn2gVoH5qx6SfcRVXd4Tdstmm9Mz9XaKmSExoKC9Kt0lXHwt55qbX19Ec+FWTgHn2HYY2+FYlMpMnRVybd7UtzELSPeUj91aVtk3nn9YaQn6YsOnFWxie35KRKkSA44Wz8ZKUBIAz0ySeRPIHnVYRmmSnKuSIB05dplh1Bb73b3C3LgSW5DKgfxkKBHu5V1Pjuofjtvt54HEhac9xGRXLfR1hman1VbNPW9tS5NwkoYRwjPDxHmo+AGST2AGupDLaGWUMtp4UISEpGc4A5Cvb/Y80/ufusNqzSmmtWQfMtSWOBdGQDwiQyFKRntSrqk+IINVm17vJax0PtY1Fp923W28WqHNKGEOpLTqEYB4QtPLHPtST41kou+FZFMgytE3Fp3tS3NQtI95Sn91T7cuUb7sOGYzbzuy2e06auWqdCyZMfzBlcl+2yF+UQWkjKvJrPpAgAnCirPeO2rFtmyrbcY1wgvKYlRnUvMuJPNC0kFJHsIFWR2q71DmpNJXHT2ntMuW/4RjrjPS5MkLUhtY4VhKEjqQSM55Z6VXOxWube71Cs9uZL0ya+hhhA/GWogD6TXRX1Y+o57OnP0nUmxThc7JAuSQAJcZt8AHIHGkK/nXsryWaEi22iFbm1cSIsdthJxjISkJH7q9dcZ2nMrbN64NafrBO+0Lq6W5p6gbN+kSvrl1S3bN64NafrBO+0Lq6W5p6gbN+kSvrl102+COWnzZvG2G1uXrZVqm1soC3n7TIS0kjOVhslP7QFcya6wkAjBGRXOPeG2eytne0edbwwU2mYtUm2OAeiplRzwZ70E8JHgD0IryiXKNXx4ZfjZbfY+ptnOn77GWlSZcBpS+HolwJCVp9qVBQ91bJXPHYltw1RswQ5b4zLN1srq/KKgyFlPAo9VNrGeAnt5EeGedTI5vixPNyW9Avl7HJKroOHPt8lnHurEqpZ2NRujjclvenv0ew7DNRLecCXJzIgMJJwVrdPCQPYjjV7EmueltiP3C4xoEVPG/JdSy0nvUogAfOa3fbJtX1PtQujMi8qajQY2fNYEfIaaz1Uc81LPefcB0rc9zrZ7I1XtJY1HKYPwPYHBIWtQ5OSBzaQPEHCz3BI7xVortx3IzfcnsXqgRm4cGPDa/q2Gktp5Y5JAA/dVavugP4H6Y+UHfq6s3VZPugP4H6Y+UHfq656/JHRb4MhHdC/tEaX/AMX9keroTXPbdC/tEaX/AMX9keroTW7/ACMUeIrntve/2iNUf4T7IzXQmue297/aI1R/hPsjNKPIX+JJ26N6t7h8sO/Us0pujere4fLDv1LNKT8mIeKLL7RYxfsAcSklTLyVcvH0cfORXn0ZpkQgi4XBAMk822z/AOr8T+d+6tsIBGCAe3nStLUzjV20ZemhK3usHmMGo51vp74PeM+Gj/hHFekkD+qUf5H/APXdWxbQNYW3R9nMuWQ7JcyI0ZJwp1X8kjtP88CvFs01fE1xpxwyWmkzWvvcyOPi884UM8+Ej5iCPGoafXwov7ae/wAf77nbqPSbr9I9Q4/SnjP5/wDPY0u2wpFwmtxIyOJxZ9wHaT4VK9jtce0wExWBk9XF45rV315bRabdp6NJkBwJT6S3HnTjgQOeM9wFaLpfbBbbnq2Ta5raIkB1zggSVHGez75npxHmD2Zwe+reo+p1uUYN4T4Ielei6idc7YRy4rf8f5JFvNsi3WEqNJTkdUqHVB7xWkWKxSoGso8aSjKG+J1KwOSwByI9+KkSv4UgqCiBkdDjpXtWpnXFwXDI3aaFklP3R/aUpXOdIqFt4/YjJ2qTLbcYN/atsqAwplLT0crQ4FKzniByn5jU00r1ScXlHkoqSwylI3b9tdlwizaigltCso8zuzzWPHBSnFf2LuwbV74+2rUWobay0k81SJrslxI/NSE4P+YdaurSqd6RPsxIz2H7GtN7LYjzsJ1y5XiSjgkXB5ASooyDwISM8CMgEjJJIGScDEmUpU223llEklhAgEYIyKrptZ3WbBqK4P3fR9xTYJbyityGtrjiqUepTj0m+fPA4h2ACrF0r2MnHg8lFS5KVtbvu3iyI80s+o2UxxyAhXp5pHLwIT+6vbG3YNqGoZKHNX6zhJbBHpOSnpjqRjsCgB+1Vx6VvuyMdmJruzbSsfRGh7XpaLLdltW9soS84kJUvKionA6c1GvdqzT9o1Tp+XYb7DRMt8tHA60rl4ggjmCDggjmCKylKnnfJTCxgp9q7dN1LbroqboXU0V9hKuJlExamJDXcAtAKVHx9H2Vj0bAtvtzb8zuOqEIjHAKZV8ecRjp8VIV2eHbV0aVTuyJ9mJXLZTur6fsE1q6azuCdQSWlBSIbbfBFSfzs+k57DwjvBrY4WxafF3kv9qbd4hi38a1CCGlBwcUQs4z0+Mc+ypqpWXZJmlXFCsDtC0rbdbaNuWl7txiLOa4CtGOJtQIUlYz2pUAfdWepWODbWSlCt2ba7Y7m/H09fYHmjx4TJj3ByP5RHZxpAznw9IDvNWw2Uaen6U2dWTTt0kMyJsGMG33WVKUha8kkgqAJHPqQK2elblNy5MRrUXsKh3bRu/aU2izHbwy85Y764PTlsNhbbxHIFxvlxHHaCD35qYqVlNrdGnFSWGUuVu1bYtOuuf0Z1RBLROQYlxejLV7U8IAPvNftvd+273lHmt41a03GJ9JMu9PvJI/ugKBq51Kp3ZE+zEh7d32JN7KnZ89+/Kuk+eylpwIY8m02kHOBkkqOe3l7KmGlKm228spGKisIr3v7+p+0/rAz9nkVVDYxYrdqfajYLBd2luQZ0ryLyULKFcJSehHQ9tWv39/U/af1gZ+zyKrJu3evTSPygn+E101+By2/wAhLus90O9sylu6Q1NBlxicpZuSVNOoHdxoCkqPjhPsrVYe6ttSfkBt34DjI7XHJpKR/lST9FXspUldIs6Ylf8AYzuy2DSFxYvmqJqL/dGVBbDIa4YzCx0Vg83COWCcAfk5wasBSlTlJy3ZuMVFYQqDtuu7vY9oNxd1BZ5osl9cH35Xk+JiUR0K0jmlX5w94J51ONKKTi8o9lFSWGUSmbq21Nh9TbSbJKQOjjc0hJ/zJB+itl0luiakkSUL1TqW2wIwOVIgpW+6oZ6ZUEpTnv8AS9lXIpVO9ImqYletp27NZ7vpWwWPRciLZha3H1vPykKcclFwIBUtQ6n72OzA6DA5Vld27YndNld7u1wuF7h3FM6MhlKWGlJKSFZyc1OFKz1yxg1245yKq/tT3VpWoNU3bUdg1Yy29c5j0xyLOjkJQtxZWQHEEnGVHHo+81aCleRk48HsoKXJROZuq7U2HOFr4ClDJ9JqaQP20JNeuy7pu0aW8j4RuFitrOfTJkLdWB4JSnB/zCrw0rfekT7ESKtiGw7TGzHM9p1d2vriChdwfbCeBJ6paRk8APacknvxyqVaUqbbbyyqSSwite2Pdhkav1hc9U2XVTUaRcHfLORZcYlCVYA5OJOccunD76iiduqbUo6+FpdhljPxmZqgP20JNXrpW1bJE3TF7lG7Run7SpboE6ZYbe3n0iuStxWPAJQQfeRVhdh+wPTOzWUm8OSF3q/hJSmY62EIYBGFBpGTwkg4KiScdMAkGX6UlZKWx7GqMdxSlKmUKo663VtQah1tfb+zqq2MNXO5SJiGlsOFSEuOKWEkjtHFip22G6JlbPdnEHS02czNejOPLLzSSlKuNxShyPPtreKVtzbWGYjXGLyhWt7RNEab19p9dk1LAEmOTxNOJPC6wvGAtCvxT9B6EEcq2SlYTwbayU61huh6gYkrc0nqW3zYxVlLVwSpl1I7uJAUlR8cJ9lamjda2rKcCTHs6ATjiM4YHjyGfoq+NKqrpEnTEqPoXdDmGS2/rbUsdDCTlUW1pKlLHd5VYHD7kn29tWj0np2y6UsMex6ft7UC3xxhtpvPU9SSeaiT1J5msrSsSm5cmowjHgVFG8jsruG1SyWm32+6xbcqDJW8pT7alBQUnGBipXpXibTyjTSawytWxXdvvegdptp1ZM1JbpjEHy3Ey0ytKlcbLjYwTy5FYPuqytKV7KTk8s8jFRWEKrVtq3b73r7abdtWQ9SW6GxO8jwsusrUpPAy22ckcuZQT76srSkZOLyhKKksMhbYvsZuegtLSbPLvUOY49NXJC2m1JABQhOOfb6B+elTTSjk28hQSWBXlu8iVFtcmTChmZJbaUppgKCS4oDknJ6V6qVhrKNxaTTayU81Zebrfr5In3lxZlFRSUEFIaAPxAk9AO75+dfbRGpJuldQsXaGSoJ9F5rOA62eqT+8dxANTbti2bIv7Tl7sjSUXZCcutDkJIH7l9x7ehqvLra2nVNOoUhxCilSVDBSR1BHYa/Haqi7S3Zk9+Uz+uemazSep6TohFJYw4/H+Ph/3Jc20bSI15trFl0/IUqK+2l2W6ORORkNe78bxwO+ohpW9bKdn8rV04SpQXHs7KsOujkXT+Qjx7z2Vic7tbd8tlaqtL6NpHviK5fu3/dkm7vt91BdbI9EubC3oMQBEaas8z/7v87A7ezoeypRr4W6FFt0FmDBYRHjMpCG20DASK+9frtNVKqpQk8tH8p9Q1MNTqJ21w6U3wKUpVzjFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoCve/v6n7T+sDP2eRVZN2716aR+UE/wAJq628Ns2l7UtIW7T0W6MWwMXRuY8+40XMIS06ghKQRk5cHUgcjzrFbLN3rQehLhFvCEzLteYyuNqXKdwG1cxlDacJHX8biPjV4zShghOtynkl6lKVAuKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQCov2xbNkX9py92RpKLshOXWhyEkD9y+49vQ1KFKjfRC+DhNbHXotbdorlbU8Nf8Af4ZWPZds7napuSnZ7bsS1xnOGQsp4VrUOrac9veez21ZW3QotugswYLCI8ZlIQ22gYCRX6i/1R/+Iv8AiNfWoaPRQ00dt2/c7PV/V7vUbMz2iuF/vuKUpXafIFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoD//Z" alt="ScalePassion" style={{ height: 28 }} />
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
