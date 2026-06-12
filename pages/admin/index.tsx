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
        <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAB5AlQDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAUGAwQBAggHCf/EAEcQAAEDAwAFBgoIBQIGAwAAAAEAAgMEBREGEiExQQcTUWFxsRQiMjVScnOBkcEIFTM0QrLR4SNTYoKhkqMWY2STwvE2Q6L/xAAbAQEBAQEBAQEBAAAAAAAAAAAAAwIEAQUGB//EAC0RAAICAQMDAwQBBAMAAAAAAAABAgMRBCExEhMyBUFRIiNhcTOxweHwFKHR/9oADAMBAAIRAxEAPwDxkiIgC+lchHJdWcoV9M1UJKew0bx4ZUDYZDvETDxceJ/CDneQDEckfJ/dOULSZtto9aCihw+uq9XLYGHvccEAe/cCvcmi9itejVipbJZqVtNRUzNVjBvPS4ni4naTxJXfotJ3X1S4/qfP1ur7S6I+X9D47y/citFerGy76HW6GlulvhEZpIGBraqJoADQPTaBsO8jZ0Y8luaWuLXAhwOCCNoX6Urzl9JzkhNSKjTjRelJnGZLnSRtzzg4zMA4+kOO/fnPTrtHldyC/ZzaHWYfbm/0eYkRF8c+yEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAVh5P8ARG76baS09js8OtJIdaWVwOpBGN73ngB/k4A2lV5ezPom2q0UvJPSXOipWMr66WXw2Y7XPcyRzWjPohoGB0k9K6dLQrrOl8HNq73RX1LkvnJ5ofaNCNGKexWiPDI/GmmcPHnkPlPd1n/AwOCsSL4py1cu9JodcpLDo7SQXO7RbKiSZx5ind6JDSC93SARjpzkD70510Qy9kfn4V2Xzwt2fa0O0YK8o6NfSb0lguDf+IbLbayic7x/BGuilYOJGXOBx0EDPSF6c0Zvls0ksVLe7PUtqaKqZrxvAweggjgQQQRwIXlOpru8Wau01lPkjzF9Jjki+oZ5tMNGaXFqlfmtpY27KV5/G0D/AOsnh+E9R2fBF+k1RDFUU8lPPEyWGVpZIx7ctc0jBBHEEL8/OU6ht1r5RNILbaIjDQ0lwmghjLi7UDXFpGTtwCCvla/TxrfXH3Pq+n6mVi6JexXERF84+kEREAREQBERAEREAREQBERAEREAREQBZqOmkqpxFFjO8kncFhUno35wPsz3haistIzN4i2atxpxS1Rha4uwBtPYtZSF/wDOcnY3uUekliTEHmKYREWTQREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBcgEkAAkncAuFnoqg01SyYMa/V4Feo8fGxJRWR7qMue/VnO1reA6ioiRj43lj2lrmnBBVuhqoJabwhrwI8ZJPDtVcu9WyrqddjA1rRgHG13aq2QikmiNU5NtM0kRFEuEREAREQBERAEREAREQBERAF6++htW+Ecl1XSuPjUt0kaB/S5kbh/kuXkFemvoR1uaXSi3E+Q+mmaOnIkafyt+K7fT5YvX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" alt="ScalePassion" style={{ height: 28 }} />
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
        <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAB5AlQDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAUGAwQBAggHCf/EAEcQAAEDAwAFBgoIBQIGAwAAAAEAAgMEBREGEiExQQcTUWFxsRQiMjVScnOBkcEIFTM0QrLR4SNTYoKhkqMWY2STwvE2Q6L/xAAbAQEBAQEBAQEBAAAAAAAAAAAAAwIEAQUGB//EAC0RAAICAQMDAwQBBAMAAAAAAAABAgMRBCExEhMyBUFRIiNhcTOxweHwFKHR/9oADAMBAAIRAxEAPwDxkiIgC+lchHJdWcoV9M1UJKew0bx4ZUDYZDvETDxceJ/CDneQDEckfJ/dOULSZtto9aCihw+uq9XLYGHvccEAe/cCvcmi9itejVipbJZqVtNRUzNVjBvPS4ni4naTxJXfotJ3X1S4/qfP1ur7S6I+X9D47y/citFerGy76HW6GlulvhEZpIGBraqJoADQPTaBsO8jZ0Y8luaWuLXAhwOCCNoX6Urzl9JzkhNSKjTjRelJnGZLnSRtzzg4zMA4+kOO/fnPTrtHldyC/ZzaHWYfbm/0eYkRF8c+yEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAVh5P8ARG76baS09js8OtJIdaWVwOpBGN73ngB/k4A2lV5ezPom2q0UvJPSXOipWMr66WXw2Y7XPcyRzWjPohoGB0k9K6dLQrrOl8HNq73RX1LkvnJ5ofaNCNGKexWiPDI/GmmcPHnkPlPd1n/AwOCsSL4py1cu9JodcpLDo7SQXO7RbKiSZx5ind6JDSC93SARjpzkD70510Qy9kfn4V2Xzwt2fa0O0YK8o6NfSb0lguDf+IbLbayic7x/BGuilYOJGXOBx0EDPSF6c0Zvls0ksVLe7PUtqaKqZrxvAweggjgQQQRwIXlOpru8Wau01lPkjzF9Jjki+oZ5tMNGaXFqlfmtpY27KV5/G0D/AOsnh+E9R2fBF+k1RDFUU8lPPEyWGVpZIx7ctc0jBBHEEL8/OU6ht1r5RNILbaIjDQ0lwmghjLi7UDXFpGTtwCCvla/TxrfXH3Pq+n6mVi6JexXERF84+kEREAREQBERAEREAREQBERAEREAREQBZqOmkqpxFFjO8kncFhUno35wPsz3haistIzN4i2atxpxS1Rha4uwBtPYtZSF/wDOcnY3uUekliTEHmKYREWTQREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBcgEkAAkncAuFnoqg01SyYMa/V4Feo8fGxJRWR7qMue/VnO1reA6ioiRj43lj2lrmnBBVuhqoJabwhrwI8ZJPDtVcu9WyrqddjA1rRgHG13aq2QikmiNU5NtM0kRFEuEREAREQBERAEREAREQBERAF6++htW+Ecl1XSuPjUt0kaB/S5kbh/kuXkFemvoR1uaXSi3E+Q+mmaOnIkafyt+K7fT5YvX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" alt="ScalePassion" style={{ height: 28 }} />
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
