# Model Choices & Architectural Trade-offs

- **Project:** FreshFold Laundry
- **Task:** Task Two — Step 3: Deliberate Model Selection & Comparative Analysis
- **Author:** Comfort Igboko
- **Date:** 3 November 2026

---

## 1. Executive Summary

In agentic software engineering, treating language models as interchangeable text generators is a primary source of architectural drift and broken invariants. Models have distinct behavioral profiles:
- **Planning-First Agents (Antigravity / Gemini 2.5/Flash-Lite / Pro with deep tool-calling loops):** Deliberate, slower to emit initial code, but grounded in local repository context, explicit rule adherence, and pre-execution confirmation.
- **Fast Code-Emission Models (Open Code / Sonnet / specialized code completers):** Rapid token throughput, optimized for local syntactic fluency, but prone to eager code generation that bypasses context files and invents ungrounded abstractions.

For FreshFold, we assigned models strictly according to the task's blast radius and verification overhead.

---

## 2. Model Assignment Matrix: Which Model for Which Job

| Task Category | Assigned Model Archetype | Primary Selection Criteria |
| :--- | :--- | :--- |
| **Initial Scaffolding & Configuration** | **Antigravity (Planning-First)** | Must read 14+ `.agent/rules/` files, halt for human confirmation, enforce zero database executions, and guarantee zero raw pixel or hex leakage. |
| **Design Token Compilation (`build-tokens.js`)** | **Antigravity** | Required recursive alias resolution (e.g., curly-bracket references across multiple JSON exports) and strict validation that failed the build on missing tokens. |
| **Isolated UI Subcomponents & Form Markup** | **Fast Code Model (Open Code)** | Single-file scope where component props, token variable names, and HTML structures are already declared in the design system contract. |
| **Database Diagnostics & Failure Simulation** | **Antigravity** | Requires step-by-step terminal verification, PID inspection (`lsof`), and logging without hallucinations. |

---

## 3. Observed Differences in Practice

### Latency vs. Deliberation
- **Antigravity:** Takes between 15 to 45 seconds before writing a single line. During this period, it invokes file listing, greps for existing conventions, loads `.agent/rules/code.md`, and drafts an explicit Phase 1 summary. This upfront latency felt slow during interactive prompting, but resulted in **zero accidental boilerplate** and zero unused dependencies.
- **Open Code / Fast Models:** Emitted files within 2 to 4 seconds. However, it skipped reading surrounding context files and immediately outputted a default `create-next-app` layout laden with Tailwind utilities (`bg-gray-100`, `text-sm`, `rounded-md`), directly violating our Vanilla CSS design token rule.

### Context Adherence & Rule Enforcement
- Antigravity respected the hard negative constraints in `.agent/rules/safety.md` (e.g., refusing to run `prisma migrate` or execute live database mutations from the agent session).
- Fast models routinely attempted to run database migration scripts automatically or fall back to arbitrary default environment variables (e.g., hardcoding `localhost:5432/freshfold` into source code).

---

## 4. One Task Where We Chose Wrong and Had to Switch

### The Incident: Scaffolding the Minimal Home Screen Shell
* **Initial Choice:** We initially prompted a fast code-writing model to scaffold the base home screen layout and reset styles, expecting a quick turnaround on basic CSS.
* **What Went Wrong:**
  1. The fast model bypassed [task-01-design-system/tokens-light.css](file:///Users/comfortigbokoalexis/Desktop/FreshFold/task-01-design-system/tokens-light.css) and invented its own CSS custom properties (`--primary-color: #3b82f6;`, `--bg-light: #f9fafb;`) instead of consuming `--freshfold-color-primary` and `--freshfold-color-surface`.
  2. It introduced hardcoded pixel values (`padding: 24px 16px; margin: 0 auto; max-width: 640px;`), violating the constraint that all layout and spacing must map to declared tokens.
  3. It generated a mock dashboard with dummy customer orders, sample tracking chips, and a fake "Log In" button—violating the strict instruction that Phase 2 must contain **only the base viewport shell and no product features**.
* **The Switch:**
  We discarded the fast model's output entirely, switched back to **Antigravity**, and enforced the 3-phase scaffolding instruction. Antigravity properly halted in Phase 1 to declare its assumptions, audited the exact token paths, declared the missing spacing tokens (`--freshfold-space-*`) to avoid arbitrary pixels, and generated a clean, single-purpose foundation shell.

---

## 5. Architectural Rule for Future Tasks

1. **Never use a fast-emission model for architecture, boundary definition, or security-sensitive code.**
2. **Use fast code models only when an explicit type definition, test harness, or token contract already exists to bound its output.**
3. **Always review git diffs against context rules, regardless of how fluent the generated code appears.**
