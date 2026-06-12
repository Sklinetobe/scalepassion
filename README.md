# Scalepassion Alignment Survey

A multi-company founder/team alignment survey. Deploy once on Vercel, generate unique survey links per company, view all results from a single admin dashboard.

---

## Deploy in 5 steps

### 1. Push to GitHub
Create a new GitHub repo and push this folder to it.

### 2. Create a Vercel project
- Go to vercel.com → New Project → import your repo
- Framework: Next.js (auto-detected)

### 3. Add Vercel KV storage
- In your Vercel project: Storage → Create → KV Database
- Name it anything (e.g. `scalepassion-kv`)
- Click "Connect to Project" — this auto-adds the KV env vars

### 4. Add your admin secret
In Vercel → Settings → Environment Variables, add:
```
ADMIN_SECRET = something-long-and-random
```

### 5. Deploy
Trigger a redeploy. Your app is live.

---

## How it works

| URL | Who uses it |
|---|---|
| `/admin` | You (Scalepassion). Password-protected. |
| `/survey/[id]` | Respondents. Unique per company. |

### Workflow
1. Go to `/admin`, log in with your `ADMIN_SECRET`
2. Click **+ Add** to create a company — this generates a unique survey link
3. Copy the link and send it to the founder + their team
4. Watch responses come in. View the gap analysis per category, who responded, and ranked conversation starters.

### Data model
- Each company has a unique ID stored in Vercel KV
- Responses accumulate under that company's record
- Founder responses are stored separately from employee responses
- The admin dashboard shows aggregate employee scores vs. the founder's score
- Individual employee answers are never displayed — only averages

### Security
- The admin dashboard is protected by `ADMIN_SECRET` (sent as a header)
- Survey links are UUID-based — not guessable, but not authenticated
- No user accounts required for respondents

---

## Local development

```bash
npm install
# Copy .env.example to .env.local and fill in your KV credentials
# (Get these from Vercel KV dashboard → your database → .env.local tab)
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000
