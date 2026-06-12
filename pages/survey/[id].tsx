import { useState } from 'react';
import { useRouter } from 'next/router';
import { QUESTIONS } from '../../lib/questions';

type Role = 'founder' | 'employee';
type Screen = 'role' | 'name' | 'questions' | 'done';

const orange = '#E8650A';
const dark = '#1a1a18';
const bg = '#f8f8f6';

export default function SurveyPage() {
  const { query } = useRouter();
  const companyId = query.id as string;
  const [screen, setScreen] = useState<Screen>('role');
  const [role, setRole] = useState<Role>('employee');
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUESTIONS.length).fill(null));
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function chooseRole(r: Role) { setRole(r); setScreen('name'); }

  function confirmName() {
    if (!name.trim()) { setNameErr(true); return; }
    setNameErr(false);
    setAnswers(new Array(QUESTIONS.length).fill(null));
    setCurrentQ(0);
    setScreen('questions');
  }

  function selectAnswer(v: number) {
    const next = [...answers]; next[currentQ] = v; setAnswers(next);
  }

  async function goNext() {
    if (answers[currentQ] === null) return;
    if (currentQ < QUESTIONS.length - 1) { setCurrentQ(q => q + 1); return; }
    setSubmitting(true);
    await fetch('/api/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, name: name.trim(), role, answers }),
    });
    setSubmitting(false);
    setScreen('done');
  }

  const progress = (currentQ / QUESTIONS.length) * 100;
  const q = QUESTIONS[currentQ];

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e4', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAB5AlQDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAUGAwQBAggHCf/EAEcQAAEDAwAFBgoIBQIGAwAAAAEAAgMEBREGEiExQQcTUWFxsRQiMjVScnOBkcEIFTM0QrLR4SNTYoKhkqMWY2STwvE2Q6L/xAAbAQEBAQEBAQEBAAAAAAAAAAAAAwIEAQUGB//EAC0RAAICAQMDAwQBBAMAAAAAAAABAgMRBCExEhMyBUFRIiNhcTOxweHwFKHR/9oADAMBAAIRAxEAPwDxkiIgC+lchHJdWcoV9M1UJKew0bx4ZUDYZDvETDxceJ/CDneQDEckfJ/dOULSZtto9aCihw+uq9XLYGHvccEAe/cCvcmi9itejVipbJZqVtNRUzNVjBvPS4ni4naTxJXfotJ3X1S4/qfP1ur7S6I+X9D47y/citFerGy76HW6GlulvhEZpIGBraqJoADQPTaBsO8jZ0Y8luaWuLXAhwOCCNoX6Urzl9JzkhNSKjTjRelJnGZLnSRtzzg4zMA4+kOO/fnPTrtHldyC/ZzaHWYfbm/0eYkRF8c+yEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAVh5P8ARG76baS09js8OtJIdaWVwOpBGN73ngB/k4A2lV5ezPom2q0UvJPSXOipWMr66WXw2Y7XPcyRzWjPohoGB0k9K6dLQrrOl8HNq73RX1LkvnJ5ofaNCNGKexWiPDI/GmmcPHnkPlPd1n/AwOCsSL4py1cu9JodcpLDo7SQXO7RbKiSZx5ind6JDSC93SARjpzkD70510Qy9kfn4V2Xzwt2fa0O0YK8o6NfSb0lguDf+IbLbayic7x/BGuilYOJGXOBx0EDPSF6c0Zvls0ksVLe7PUtqaKqZrxvAweggjgQQQRwIXlOpru8Wau01lPkjzF9Jjki+oZ5tMNGaXFqlfmtpY27KV5/G0D/AOsnh+E9R2fBF+k1RDFUU8lPPEyWGVpZIx7ctc0jBBHEEL8/OU6ht1r5RNILbaIjDQ0lwmghjLi7UDXFpGTtwCCvla/TxrfXH3Pq+n6mVi6JexXERF84+kEREAREQBERAEREAREQBERAEREAREQBZqOmkqpxFFjO8kncFhUno35wPsz3haistIzN4i2atxpxS1Rha4uwBtPYtZSF/wDOcnY3uUekliTEHmKYREWTQREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBcgEkAAkncAuFnoqg01SyYMa/V4Feo8fGxJRWR7qMue/VnO1reA6ioiRj43lj2lrmnBBVuhqoJabwhrwI8ZJPDtVcu9WyrqddjA1rRgHG13aq2QikmiNU5NtM0kRFEuEREAREQBERAEREAREQBERAF6++htW+Ecl1XSuPjUt0kaB/S5kbh/kuXkFemvoR1uaXSi3E+Q+mmaOnIkafyt+K7fT5YvX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" alt="ScalePassion" style={{ height: 28 }} />
        <span style={{ fontSize: 12, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Radiate Purpose</span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>

          {screen === 'role' && (
            <>
              <div style={{ width: 40, height: 4, background: orange, borderRadius: 99, marginBottom: '1.5rem' }} />
              <h1 style={{ fontSize: 28, fontWeight: 600, color: dark, marginBottom: 10, lineHeight: 1.2 }}>Where do things stand?</h1>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>This takes about 4 minutes. Your answers help surface the gap between what leadership believes and what the team experiences.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { r: 'founder' as Role, title: "I'm the founder", desc: 'Your perspective is tracked separately to reveal the gap.' },
                  { r: 'employee' as Role, title: "I'm a team member", desc: 'Your answers are anonymous and combined with others.' },
                ].map(({ r, title, desc }) => (
                  <button key={r} onClick={() => chooseRole(r)}
                    style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: 12, padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = orange)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e4')}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: dark, marginBottom: 6 }}>{title}</p>
                    <p style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>{desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {screen === 'name' && (
            <>
              <div style={{ width: 40, height: 4, background: orange, borderRadius: 99, marginBottom: '1.5rem' }} />
              <h1 style={{ fontSize: 28, fontWeight: 600, color: dark, marginBottom: 10 }}>{role === 'founder' ? 'Welcome, founder.' : 'Add your perspective.'}</h1>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {role === 'founder' ? 'Your answers are stored separately to compare against your team.' : 'Your name helps the founder understand who responded — your individual scores stay private.'}
              </p>
              {nameErr && <p style={{ fontSize: 13, color: '#c0392b', marginBottom: 10 }}>Please enter a name to continue.</p>}
              <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmName()}
                placeholder={role === 'founder' ? 'Your name' : 'Your name or role (e.g. Head of Sales)'}
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, border: '1.5px solid #ddd', borderRadius: 8, background: '#fff', color: dark, marginBottom: '1rem', outline: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setScreen('role')} style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: 8, padding: '10px 20px', fontSize: 14, color: '#666', cursor: 'pointer' }}>Back</button>
                <button onClick={confirmName} style={{ background: orange, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Start survey</button>
              </div>
            </>
          )}

          {screen === 'questions' && (
            <>
              <div style={{ background: '#e8e8e4', borderRadius: 99, height: 4, marginBottom: '1.5rem' }}>
                <div style={{ height: 4, borderRadius: 99, background: orange, width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 8, letterSpacing: '0.04em' }}>Question {currentQ + 1} of {QUESTIONS.length}</p>
              <p style={{ fontSize: 18, fontWeight: 500, color: dark, lineHeight: 1.6, marginBottom: '2rem' }}>{role === 'founder' ? q.tf : q.te}</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => selectAnswer(v)}
                    style={{ flex: 1, aspectRatio: '1', border: answers[currentQ] === v ? `2px solid ${orange}` : '1.5px solid #ddd', borderRadius: 10, background: answers[currentQ] === v ? '#FEF0E6' : '#fff', fontSize: 16, fontWeight: 600, color: answers[currentQ] === v ? orange : '#999', cursor: 'pointer', transition: 'all 0.12s' }}>
                    {v}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#bbb', marginBottom: '2rem' }}>
                <span>Strongly disagree</span><span>Strongly agree</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => currentQ > 0 && setCurrentQ(q => q - 1)} style={{ visibility: currentQ === 0 ? 'hidden' : 'visible', background: 'transparent', border: '1px solid #ddd', borderRadius: 8, padding: '10px 20px', fontSize: 14, color: '#666', cursor: 'pointer' }}>Back</button>
                <button onClick={goNext} disabled={answers[currentQ] === null || submitting}
                  style={{ background: answers[currentQ] !== null ? orange : '#ddd', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: answers[currentQ] !== null ? 'pointer' : 'default', transition: 'background 0.15s' }}>
                  {submitting ? 'Submitting...' : currentQ === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </>
          )}

          {screen === 'done' && (
            <>
              <div style={{ width: 40, height: 4, background: orange, borderRadius: 99, marginBottom: '1.5rem' }} />
              <h1 style={{ fontSize: 28, fontWeight: 600, color: dark, marginBottom: 12 }}>You're done.</h1>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
                {role === 'founder'
                  ? 'Your perspective is saved. Share the survey link with your team — the gap analysis unlocks once responses come in.'
                  : 'Your response has been added to the aggregate. The founder will see the gap analysis in their dashboard. Your individual answers are private.'}
              </p>
              <div style={{ background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FEF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔥</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: dark, marginBottom: 2 }}>ScalePassion</p>
                  <p style={{ fontSize: 13, color: '#888' }}>Helping founders scale without losing their soul. <a href="https://scalepassion.com" style={{ color: orange }}>Learn more</a></p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      <footer style={{ padding: '16px 24px', borderTop: '1px solid #e8e8e4', background: '#fff', textAlign: 'center', fontSize: 12, color: '#bbb' }}>
        © ScalePassion 2026 · <a href="https://scalepassion.com" style={{ color: '#bbb' }}>scalepassion.com</a>
      </footer>
    </div>
  );
}
