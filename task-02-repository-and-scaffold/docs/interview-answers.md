# Technical Interview Defence: Task Two

- **Project:** FreshFold Laundry
- **Author:** Comfort Igboko
- **Date:** 3 November 2026
- **Word Count Target:** Maximum 200 words per response.

---

### 1. What is the difference between Git Flow and trunk-based development, and why have a lot of teams moved toward trunk-based?
Git Flow relies on long-lived branches (`develop`, `release`, `feature`, `hotfix`, `main`). Features live on isolated branches for weeks before merging, resulting in painful "merge hell", delayed integration feedback, and stale branches.

Trunk-based development mandates that all engineers merge small, frequent commits directly into a single shared branch (`main` or "trunk") at least daily. Feature flags gate incomplete functionality rather than branching isolation.

Teams shifted to trunk-based because continuous integration requires continuous merging. Short-lived branches (hours, not weeks) reduce conflict complexity from hours of manual resolution to trivial diffs. It enables automated CI/CD pipelines to validate code continuously, speeding up deployment cadence from monthly releases to multiple daily production updates.

---

### 2. What does git push --force actually do, and why is --force-with-lease generally safer?
`git push --force` (`-f`) unconditionally overwrites the remote branch ref with your local commit history, destroying any commits that exist on the remote repository that you do not have locally.

`--force-with-lease` is a protected override. It acts as a compare-and-swap check: Git verifies that the remote branch's current commit hash matches what your local tracking ref (`origin/branch`) expects. If another developer pushed commits to that remote branch in the interim, `--force-with-lease` refuses the push, alerting you to fetch their changes.

Use `--force-with-lease` on private feature branches after rebasing to preserve teammate work while updating history safely.

---

### 3. Why is rewriting history, through rebase, amend or force push, dangerous on a shared branch?
Commits in Git are cryptographically hashed based on their tree, metadata, author, and parent hashes. Rewriting history via `git rebase`, `commit --amend`, or reset generates completely new commit hashes for identical changes.

When pushed to a shared branch, teammates whose local branches are based on the original commit hashes become detached. When they run `git pull`, Git attempts to reconcile the diverged histories, creating duplicate commits, phantom merge conflicts, and potentially resurrecting deleted code. Never rewrite history on shared branches (`main`, `develop`); only clean history locally prior to merging.

---

### 4. What is the difference between git merge and git rebase, and when would you actually pick one over the other?
`git merge` creates a non-destructive 3-way merge commit joining two branches. It preserves complete chronological truth, showing exactly when branches diverged and re-joined, but can clutter history with merge noise.

`git rebase` replays your branch commits on top of another base commit, creating a linear, straight-line history without merge commits. However, it rewrites commit hashes.

Pick **rebase** on private, local feature branches to stay up to date with `main` before submitting a PR. Pick **merge** (specifically squash-merge or explicit merge commit) when closing a PR into `main` to preserve an auditable integration boundary.

---

### 5. What causes a merge conflict, and what is actually happening in the file when you see the conflict markers?
A merge conflict occurs when two branches modify the exact same lines of a file since their common ancestor commit, or when one branch deletes a file that another branch modified. Git cannot mathematically deduce which change represents developer intent.

Inside the file, Git halts and inserts conflict markers:
- `<<<<<<< HEAD`: Shows the content on your current branch.
- `=======`: The divider separating divergent versions.
- `>>>>>>> branch-name`: Shows the incoming changes from the branch being merged.

The file remains in a conflicted, uncommitted state until an engineer manually edits the text and stages the resolution.

---

### 6. What is the difference between the working directory, the staging area and the repository?
- **Working Directory:** The actual local filesystem tree of files you see and edit in your IDE. Changes here are unstaged and not yet tracked in Git's object database.
- **Staging Area (Index):** A binary file (`.git/index`) that acts as a preparation canvas. Running `git add` stages specific file snapshots, allowing you to craft atomic, intentional commits rather than blindly committing all edits.
- **Repository (Object Store):** The permanent `.git` database containing cryptographically hashed commit objects, trees, and blobs. Once staged changes are committed (`git commit`), they are permanently recorded in the local repository history.

---

### 7. What is branch protection, and what does it typically enforce?
Branch protection is a GitHub/GitLab repository governance rule applied to designated target branches (like `main`). It strips individual developers (even repo administrators) of the ability to modify production code unilaterally.

It typically enforces:
1. Blocking direct pushes (`git push origin main` is rejected).
2. Requiring peer review and sign-off on pull requests before merging.
3. Requiring CI status checks (type checking, linting, automated unit tests) to pass.
4. Requiring up-to-date branches before merging.
5. Blocking force-pushes (`--force`) and branch deletions.

---

### 8. Walk me through a technical project you built end to end.
I built the full-stack architecture for FreshFold Laundry, an owner-run laundry application designed for customers in Nigeria on low-bandwidth Android phones.

Starting from brand tokens in Figma, I built an automated Node.js token compiler that normalized recursive aliases into semantic CSS custom properties. I then scaffolded a Next.js App Router application in strict TypeScript, enforcing zero arbitrary styling.

On the backend, I designed an intake enquiry pipeline using server-only persistence with `201 Created` verification, built database failure simulations to detect false-success bugs, and implemented fluid responsive typography with CSS `clamp()`. The entire initial transfer footprint is kept to 103 kB, well below the 200 kB budget.

---

### 9. Tell me about a time when something you built broke in production.
In an early service rollout, an API endpoint swallowed database connection timeouts in a `try/catch` block and returned `{ status: "success" }` with `HTTP 200 OK`.

In production, when the connection pool was exhausted, users continued receiving visual green confirmation banners while hundreds of orders were silently dropped without database writes. Conversion dropped to zero because no records existed.

To resolve it, I established strict API error boundaries: asynchronous writes must return `201 Created` with the assigned entity ID and timestamp. Errors must fail loudly with `500` and trigger alerts. I also implemented database health-check endpoints.

---

### 10. How do you approach learning a new technical platform or codebase quickly when starting a new engagement?
I follow a 4-step diagnostic protocol:
1. **Find the Data Boundaries:** I read the schema files (`schema.prisma` or migration SQL) first. Understanding models and relationships explains the business model faster than UI code.
2. **Trace the Entry Points:** I follow one critical user request from frontend route to API handler, middleware, database query, and return response.
3. **Audit Invariants & Context:** I read repository rules, `.env.example`, and CI pipelines to discover non-negotiable architectural boundaries.
4. **Reproduce the Setup:** I clone the project and run the build and test suites from scratch, documenting any friction in onboarding documentation.

---

### 11. What is the difference between code that is correct and code that is complete?
- **Correct Code:** Code that satisfies the happy-path unit tests and functional requirements under expected inputs. Given valid data, it produces the expected calculation or visual output.
- **Complete Code:** Code engineered for real-world hostility and lifecycle maintenance. Complete code validates inputs at route boundaries, handles database disconnections, returns correct HTTP status codes (`201` vs `200`), provides accessible error announcements for screen readers, enforces rate limits, logs actionable diagnostics without leaking secrets, and includes rollback plans.

Correct code runs in a demo; complete code survives in production.

---

### 12. How do you design software for a customer who will need to maintain it after you are gone?
1. **Single Sources of Truth:** Centralize configuration and constants. In FreshFold, all customer-facing text lives in one module (`lib/text.ts`), and all colors derive from compiled CSS tokens.
2. **Explicit Contracts Over Magic:** Use strict TypeScript types, runtime Zod validation, and avoid clever, unreadable abstractions.
3. **Defensive Isolation:** Enforce server-only modules so frontend changes cannot accidentally expose database clients or secrets.
4. **Actionable Documentation:** Write a comprehensive `README.md` with exact copy-paste onboarding steps and maintain a tracked defect register (`defects.md`) so successors know known limitations immediately.

---

### 13. Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.
Our cold development first load took **2,939 ms** (`curl` total time), dropping to **36 ms** on second load.

**What I Can Measure:**
- Network connection setup: 0.24 ms.
- Next.js server module compilation: **2,700 ms** across 579 modules (reported directly in dev server logs).
- Time to Start Transfer: 2,933 ms.

**What I Am Guessing About:**
- Disk I/O latency when Node read hundreds of node_modules from the SSD during cold compile.
- Next.js internal AST parsing and Tailwind/CSS variable resolution overhead.
- React 19 server component tree serialization latency prior to streaming HTML to curl.

---

### 14. Your application reported success to the user while writing nothing to the database. Explain the mechanism that allowed that, and name the one check that would have caught it in thirty seconds.
The mechanism is **exception swallowing with optimistic status masking**:
The API handler wrapped the database write in a `try/catch` block. When `DATABASE_URL` was unreachable, the data layer threw an error, but the `catch` handler caught the exception, failed to rethrow, and returned `HTTP 200 OK` with `{ success: true }`. The browser received a 200, cleared the form, and rendered a success message.

**The 30-Second Check:**
Inspect the Network devtools or terminal log during submission. A resource creation must return **`HTTP 201 Created`**, and querying the database inspector immediately must show the row ID and UTC timestamp. A `200 OK` on a creation route is an immediate red flag.

---

### 15. Wrong-answer analysis. A candidate says: "I always check my app is working by signing up a test user and confirming I get taken to the dashboard. If the dashboard loads, the backend is working." Say what is wrong with this, what it would miss, and what you would do instead.
**What is Wrong:**
This conflates client-side route navigation with backend persistence. In modern single-page and hybrid apps, a frontend can navigate to `/dashboard` upon receiving an HTTP 200, or even purely on optimistic client state, without a single row ever touching the database (Aisha's scenario).

**What it Misses:**
It misses unhandled database write failures, missing foreign key constraints, broken background jobs, race conditions, and uncommitted transactions.

**What to Do Instead:**
1. Verify the server logs emit `HTTP 201 Created`.
2. Inspect the live database table directly using a query or inspector tool to verify row ID, foreign keys, and timestamps exist.
3. Deliberately break the connection to confirm the UI fails gracefully.
