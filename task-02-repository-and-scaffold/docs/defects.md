# Documented Defects & Production Cost Analysis (Task 2)

- **Project:** FreshFold Laundry
- **Task:** Task Two: Repository Scaffolding, Diagnostics & Information Design
- **Prepared:** 3 November 2026
- **Status:** Open for remediation in Task 3 and Task 4

---

## Defect Register

| ID | Severity | File Reference | Finding | Production Cost |
| :--- | :--- | :--- | :--- | :--- |
| **SC-01** | Medium | [lib/db.ts#L47-L52](file:///Users/comfortigbokoalexis/Desktop/FreshFold/lib/db.ts#L47-L52) | Concurrent write race condition: `fs.writeFileSync` on `data/enquiries.json` lacks atomic file locking. | In multi-user production, concurrent customer intakes will overwrite each other, permanently dropping customer clothes records without server error. |
| **SC-02** | Medium | [app/api/enquiry/route.ts#L29-L34](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/api/enquiry/route.ts#L29-L34) | Lax phone validation: endpoint validates presence of `phone` string but does not enforce E.164 regex format. | Malformed phone numbers (e.g. `12345` or letters) get stored, preventing staff from contacting customers for home pickup. |
| **SC-03** | Low | [app/not-found.tsx#L10-L21](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/not-found.tsx#L10-L21) | Inline styling in 404 component instead of declared utility class in `globals.css`. | Increases HTML payload and prevents CSS caching on repeat 404 hits. |
| **SC-04** | High | [app/api/enquiry/route.ts#L61-L69](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/api/enquiry/route.ts#L61-L69) | "False Success" vulnerability: route handler can be manipulated via query param to return `200 OK` on database exceptions. | In production, an unhandled exception or upstream timeout could masquerade as successful order creation, losing business revenue. |
| **SC-05** | Medium | [app/page.tsx#L45](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/page.tsx#L45) | Text-wrap balance browser support variance: `text-wrap: balance` is ignored on older Android WebViews. | On older budget devices running Chrome <114, headlines degrade to ragged right alignment with trailing orphans. |

---

## Detailed Production Cost Analysis

### SC-01 — Concurrent Write Race Condition in `lib/db.ts`
* **File & Lines:** [lib/db.ts: lines 47-52](file:///Users/comfortigbokoalexis/Desktop/FreshFold/lib/db.ts#L47-L52)
* **Finding:** When `insertEnquiry` runs, it reads `data/enquiries.json`, appends the new record to an in-memory array, and writes the entire string back using `fs.writeFileSync`.
* **Cost in Production:** If two customers submit pickup requests within the same 50ms window (e.g., during Monday morning rush), Request B reads the file before Request A writes back. Request B's write overwrites Request A's write. The customer receives a `201 Created` confirmation, but their clothes record disappears.
* **Remediation Plan for Task 4:** Transition to PostgreSQL transactions with row-level locks via Prisma.

### SC-02 — Missing Strict E.164 Phone Format Validation
* **File & Lines:** [app/api/enquiry/route.ts: lines 29-34](file:///Users/comfortigbokoalexis/Desktop/FreshFold/app/api/enquiry/route.ts#L29-L34)
* **Finding:** The endpoint checks `if (!phone)` but accepts any non-empty string.
* **Cost in Production:** Customers typing Nigerian local formats (e.g., `080...` without country code) or spam bots submitting single-token digits pass through. Staff attempting automated WhatsApp notifications or SMS dispatch fail to connect.
* **Remediation Plan for Task 3:** Implement client-side and server-side Zod validation enforcing `^\+234[789][01]\d{8}$`.
