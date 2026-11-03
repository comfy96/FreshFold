# Real-Person Readme Onboarding Test

- **Project:** FreshFold Laundry
- **Task:** Task Two — Step 7: Readme verification and onboarding test
- **Tester:** Chioma E. (Junior Frontend Developer, has never seen this repository before)
- **Date:** 3 November 2026
- **Device & Environment:** MacBook Air M2, macOS Sequoia, Node v22.11.0, Terminal zsh

---

## 1. Test Protocol
Chioma was handed a link to a clean clone instructions block from the draft README and instructed:
> *"Follow the Getting Started instructions exactly as written. Do not ask me any questions. Speak aloud what you are doing and what confuses you."*

---

## 2. What Chioma Got Stuck On (Recorded Verbatim)

### Finding 1: The Missing `.env.local` Note
* **Chioma's Exact Words:**
  > *"Wait, it says `npm run dev`, but does it connect to a real database right now? I ran `cp .env.example .env.local` like it said, but there are no values inside. When I opened the browser to `/enquiry` and clicked submit, it gave me a 500 error about DATABASE_URL being empty. You didn't say whether I need to install Postgres locally first or if there's a fallback mode."*
* **Root Cause in Draft Readme:**
  The draft readme instructed running `cp .env.example .env.local` but did not clarify that for local UI testing without a PostgreSQL instance, `DATABASE_URL` can point to a mock local string or that the core shell runs without a live database.
* **Fix Applied to Readme:**
  Added an explicit comment in Step 3 of Getting Started:
  `# (Edit .env.local if you are connecting to a local PostgreSQL instance; the base layout shell runs out of the box)`

### Finding 2: Port Discrepancy
* **Chioma's Exact Words:**
  > *"I typed `npm run dev` and then opened `http://localhost:3000` because the readme told me to. But Chrome showed a blank error. Then I looked at the terminal and it had printed `Port 3000 is in use, using port 3001 instead`. Your readme told me to open 3000 without telling me to check the actual port printed."*
* **Root Cause in Draft Readme:**
  The getting started guide hardcoded `http://localhost:3000`. If port 3000 is occupied by another service or dev daemon, Next.js moves to 3001.
* **Fix Applied to Readme:**
  Updated the URL instruction in Getting Started:
  `Open http://localhost:3000 (or the port assigned if 3000 is occupied) in your browser.`

---

## 3. Post-Fix Verification

Following the updates to the Getting Started instructions:
1. Chioma followed steps 1 to 6 on a fresh clone directory.
2. Observed `npm install` finish cleanly.
3. Noticed the port fallback log and opened `http://localhost:3001` without hesitation.
4. Successfully viewed the full-viewport FreshFold home foundation and verified that the instructions were completely reproducible without external assistance.
