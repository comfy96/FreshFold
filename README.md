# Fresh Fold Laundry (Tally)

## 1. What this is
Fresh Fold is an owner-run neighbourhood laundry application in Nigeria that lets existing customers like Amaka Obi check the verified truth about their own laundry orders—item count, washing/ironing status, and payment records, each dated—directly from the shop's approved records, while staying lightweight and calm on entry-level Android devices with small data bundles.

## 2. Status
- **Task 1 (Design System):** Finished. Tokens compiled to semantic CSS custom properties (`tokens.css` for dark mode, `tokens-light.css` for light mode). Contrast ratios, typography formulas, defect register, and reference HTML screens validated.
- **Task 2 (Repository & Scaffold):** In progress. Foundation layout shell and full-viewport home container complete. Server lifecycle, cold-load diagnostics, failure recoveries (nested folder, port conflict, 404), and database write persistence / false-success tests verified.
- **Task 3 (Client Validation & Accessibility):** Not started.
- **Task 4 (Server Security & Migrations):** Not started.
- **Task 5 (Sessions & Compliance):** Not started.

## 3. The Stack, with Reasons
- **Next.js (App Router, v15.2):** Chosen for server-rendered HTML shells and granular server-only boundary enforcement; alternative (SPA like Vite) requires exposing API tokens and loading large JS bundles on low-end mobile devices.
- **TypeScript (Strict Mode):** Chosen to enforce compile-time record shapes and eliminate null-dereference errors across order and payment models; alternative (plain JavaScript) permits silent record corruption.
- **Vanilla CSS / Semantic Tokens:** Chosen for zero runtime overhead and strict alignment with design tokens; alternative (Tailwind CSS) tempts ungrounded utility creep and increases CSS footprint on mobile data.
- **PostgreSQL with pgvector:** Chosen to host both relational business records and vector embeddings in one ACID-compliant database; alternative (separate vector database like Pinecone) introduces network hops and synchronization failure states.
- **Prisma ORM:** Chosen for strongly typed database schemas and auditable migrations; raw vector queries are handled via isolated SQL helpers to prevent schema pollution.

## 4. Getting Started
Follow these exact steps from a fresh clone:

```bash
# 1. Clone the repository
git clone https://github.com/comfy96/FreshFold.git
cd FreshFold

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# (Edit .env.local if you are connecting to a local PostgreSQL instance)

# 4. Run type check to ensure integrity
npm run type-check

# 5. Build for production (optional check)
npm run build

# 6. Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port assigned if 3000 is occupied) in your browser.

## 5. Environment Variables
Declared in `.env.example`. Never commit actual secrets or credentials.

- `DATABASE_URL`: Primary database connection string used by the application runtime.
- `DIRECT_URL`: Direct database connection used by migration runners (bypassing connection pools).
- `GEMINI_API_KEY`: API key for Gemini embedding and classification services.
- `PAYMENTS_ENABLED`: In-app payment feature flag (`false` by default in MVP).
- `GATEWAY_SECRET_KEY`: Payment gateway secret key (test mode only).
- `GATEWAY_WEBHOOK_SECRET`: Secret used to verify incoming payment webhook signatures.

## 6. What this Deliberately Does Not Do
- **No general AI laundry advice or open internet search:** The model answers only from approved shared cards; it will never hallucinate fabric care advice or general trivia.
- **No client-driven pricing, balances, or status updates:** All financial balances and order counts are calculated strictly in server code from immutable ledger entries.
- **No photo/screenshot upload for payment proof:** Unverified bank transfer screenshots are not accepted; a transfer is confirmed only when a staff verifier spots the funds in the bank account.
- **No automated reminders, push notifications, or chasers:** Respects customer data bundles; customers check the app when they need proof or status.
- **No community chat, forums, or customer-to-customer communication:** Built as a private digital receipt book, not a social platform.

## 7. Known Defects
1. [task-01-design-system/doc/defects.md#L46](file:///Users/comfortigbokoalexis/Desktop/FreshFold/task-01-design-system/doc/defects.md#L46) (`DS-01`): Primitive palette source exports Tone 40 with the exact hex value of Tone 50 (`#d04b17` instead of `#c2410c`), resulting in a slightly lighter primary color.
2. [task-01-design-system/doc/defects.md#L55](file:///Users/comfortigbokoalexis/Desktop/FreshFold/task-01-design-system/doc/defects.md#L55) (`DS-02`): White text on light primary button yields a `4.47:1` contrast ratio, slightly below WCAG AA `4.5:1` threshold for normal text.
3. [task-02-repository-and-scaffold/docs/defects.md#L20](file:///Users/comfortigbokoalexis/Desktop/FreshFold/task-02-repository-and-scaffold/docs/defects.md#L20) (`SC-01`): Port 3000 collision occurs automatically on machines running background development daemons, falling back to port 3001.
4. [task-02-repository-and-scaffold/docs/defects.md#L30](file:///Users/comfortigbokoalexis/Desktop/FreshFold/task-02-repository-and-scaffold/docs/defects.md#L30) (`SC-02`): Development server cold start takes ~2.9s due to on-demand module graph compilation, contrasting with the sub-50ms target achieved in static production builds.
