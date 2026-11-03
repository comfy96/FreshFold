# Performance Note: First Page Load Latency & Diagnostics

- **Project:** FreshFold Laundry
- **Environment:** Local Next.js 15 App Router development server (`next dev`) on macOS
- **Port:** `3001` (automatically assigned when port 3000 was in use)
- **Timestamp:** 3 November 2026

## 1. Measured Metrics

| Request Type | Measured Latency (curl total) | Server Compilation Log | HTTP Status |
| :--- | :--- | :--- | :--- |
| **First Load (Cold)** | **2,939.4 ms** (~2.94 s) | `GET / 200 in 2930ms` (compiled in 2.7s across 579 modules) | `200 OK` |
| **Second Load (Reload)** | **36.2 ms** (~0.036 s) | `GET / 200 in 31ms` | `200 OK` |

## 2. Distance from a Reasonable Target

- **Reasonable Production Target:** ~10 ms to 50 ms for an edge-served or locally cached static route.
- **Development Cold Gap:** At **2,939 ms**, the cold first load is approximately **290x slower** than a 10 ms target.
- **Reload Comparison:** The second load drops to **36.2 ms** (within the expected range for local Node.js serving), representing an **81x speedup** once compiled.

## 3. What Accounts for the Gap

The 2.9-second initial delay is almost entirely attributable to development server on-demand compilation:
1. **On-Demand Compilation (`next dev`):** Next.js does not pre-bundle the application upon running `npm run dev`. Instead, the compilation pipeline begins only when the initial HTTP request hits the route (`○ Compiling / ...`).
2. **Module Graph Resolution:** The server parsed, transformed, and bundled 579 modules (including React 19 runtime, Next.js server actions / routing infrastructure, Plus Jakarta Sans font loaders, and CSS token parsing), taking 2,700 ms.
3. **Client-Side vs. Dev Server Divergence:** In development, Fast Refresh and sourcemap generators run synchronously during the first hit. In a production build (`next build && next start`), this work is done ahead of time (`Route /: 123 B static`), dropping time-to-first-byte (TTFB) to near wire latency (~5–15 ms).
4. **Dev vs. Prod Implications for Amaka Obi:** On an entry-level Android phone on throttled 3G in Nigeria, a 3-second cold compilation on a server would exhaust data and trigger connection timeouts. This reinforces why FreshFold must be served as pre-rendered static shells with aggressive service-worker caching (PRD section 8.4) so that first paint is decoupled from server compute.
