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
        <img src="/SP_logo.png" alt="ScalePassion" style={{ height: 28 }} />
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
