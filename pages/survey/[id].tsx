import { useState } from 'react';
import { useRouter } from 'next/router';
import { QUESTIONS } from '../../lib/questions';

type Role = 'founder' | 'employee';
type Screen = 'role' | 'name' | 'questions' | 'done';

const purple = '#534AB7';
const purpleLight = '#EEEDFE';

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
    const next = [...answers];
    next[currentQ] = v;
    setAnswers(next);
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
    <div style={{ minHeight: '100vh', background: '#f8f8f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: purple }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scalepassion</span>
        </div>

        {screen === 'role' && (
          <>
            <p style={{ fontSize: 11, fontWeight: 500, color: purple, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Alignment survey</p>
            <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 10 }}>Where do things stand?</h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: '1.5rem' }}>This takes about 4 minutes. Your answers are aggregated anonymously with the rest of the team.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { r: 'founder' as Role, icon: '🚀', title: "I'm the founder", desc: 'Your perspective is tracked separately so we can surface the gap.' },
                { r: 'employee' as Role, icon: '👥', title: "I'm a team member", desc: 'Your answers are anonymous and combined with other responses.' },
              ].map(({ r, title, desc }) => (
                <button key={r} onClick={() => chooseRole(r)} style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: 12, padding: '1.25rem', textAlign: 'left', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = purple)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#ddd')}>
                  <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {screen === 'name' && (
          <>
            <p style={{ fontSize: 11, fontWeight: 500, color: purple, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Quick setup</p>
            <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 10 }}>{role === 'founder' ? 'Welcome, founder.' : 'Add your perspective.'}</h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {role === 'founder' ? 'Your answers are stored separately so we can show your view vs. the team.' : 'Your name or role helps the founder understand who responded — your individual answers stay private.'}
            </p>
            {nameErr && <p style={{ fontSize: 13, color: '#c0392b', marginBottom: 10 }}>Please enter a name to continue.</p>}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              placeholder={role === 'founder' ? 'Your name' : 'Your name or role (e.g. Head of Sales)'}
              style={{ width: '100%', padding: '10px 12px', fontSize: 15, border: '0.5px solid #ccc', borderRadius: 8, background: '#fff', color: '#1a1a18', marginBottom: '1rem', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setScreen('role')} style={{ background: 'transparent', border: '0.5px solid #ccc', borderRadius: 8, padding: '10px 20px', fontSize: 14, color: '#555' }}>Back</button>
              <button onClick={confirmName} style={{ background: purple, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 500 }}>Start survey</button>
            </div>
          </>
        )}

        {screen === 'questions' && (
          <>
            <div style={{ background: '#e8e8e4', borderRadius: 99, height: 4, marginBottom: '1.5rem' }}>
              <div style={{ height: 4, borderRadius: 99, background: purple, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Question {currentQ + 1} of {QUESTIONS.length}</p>
            <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {role === 'founder' ? q.tf : q.te}
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => selectAnswer(v)}
                  style={{ flex: 1, aspectRatio: '1', border: answers[currentQ] === v ? `1.5px solid ${purple}` : '0.5px solid #ddd', borderRadius: 8, background: answers[currentQ] === v ? purpleLight : '#fff', fontSize: 15, fontWeight: 500, color: answers[currentQ] === v ? purple : '#888', transition: 'all 0.12s' }}>
                  {v}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: '1.75rem' }}>
              <span>Strongly disagree</span><span>Strongly agree</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => currentQ > 0 && setCurrentQ(q => q - 1)} style={{ visibility: currentQ === 0 ? 'hidden' : 'visible', background: 'transparent', border: '0.5px solid #ccc', borderRadius: 8, padding: '10px 20px', fontSize: 14, color: '#555' }}>Back</button>
              <button onClick={goNext} disabled={answers[currentQ] === null || submitting}
                style={{ background: answers[currentQ] !== null ? purple : '#ccc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 500, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting...' : currentQ === QUESTIONS.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </>
        )}

        {screen === 'done' && (
          <>
            <p style={{ fontSize: 11, fontWeight: 500, color: purple, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Done</p>
            <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 12 }}>Locked in.</h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6 }}>
              {role === 'founder'
                ? 'Your perspective is saved. Share the survey link with your team and check the Scalepassion dashboard once responses come in.'
                : 'Your response has been added to the aggregate. The founder will see it in the dashboard — your individual answers are private.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
