# Scaffolding Prompt Documentation

- **Project:** FreshFold Laundry
- **Task:** Task Two: Scaffold it, ship the repository, then find out what is actually running
- **Date:** 3 November 2026

## 1. First Draft Prompt

```text
Scaffold a Next.js application for FreshFold Laundry using TypeScript. Look at our design tokens and rules, set up the project structure, and create a basic home page. Don't use Tailwind. Make sure you use the fonts and colors from the design system.
```

## 2. Final Tightened Prompt

```markdown
### FreshFold Scaffolding Instruction

Read every context and design system file in this workspace before generating or modifying any code. These files are your strict, single source of truth. If any two files disagree, stop and ask me directly rather than assuming.

**Phase 1: Analysis & Confirmation (Execute First)**
1. Provide a concise summary of the architecture, tech stack, and design system rules you identified.
2. Explicitly state every technical or configuration assumption you are bringing into the setup.
3. Halt completely. Do not write, scaffold, or touch any code until I review your summary and give explicit approval.

**Phase 2: Scaffolding (Run ONLY after approval)**
1. Initialize the project configuration and standard folder structure.
2. Build only the foundation: the base layout shell and a minimal, full-viewport (100vh / 100dvh) home screen. Do not scaffold any product features, auth flows, routes, or dashboard views.
3. Apply styling strictly via the workspace's design system tokens (colors, typography scale, spacing). Hardcoded hex codes, raw RGB values, or arbitrary pixel units are forbidden. Follow color roles and hierarchy strictly as defined in the design files.
4. Output:
   - A flat inventory of every file and directory created or modified.
   - An explicit list of all assumptions made during the scaffolding.

**Phase 3: Self-Audit (Pre-Completion Check)**
Before concluding, perform a line-by-line self-audit of your output against these instructions:
- Confirm whether every color and style maps directly to a declared design token.
- Confirm whether anything beyond the minimal base layout was created.
- Flag any deviations, accidental boilerplate, or unverified defaults.
```

## 3. What Changed Between Them and Why

The first draft suffered from the classic AI scaffolding failure mode: it allowed unconstrained generation. Left with "create a basic home page" and "look at our design tokens", an agent instinctively writes auth handlers, mock dashboard widgets, sample cards, and boilerplate utility classes, while silently guessing when tokens or directories are ambiguous.

The final prompt enforced three critical gates:
1. **The Phased Execution Gate (Halt completely):** Splitting analysis from scaffolding forced the agent to inspect all rules files (`AGENT.md`, `.agent/rules/*`), state its architectural understanding, and expose every technical assumption *before* writing code.
2. **Strict Scope Lockdown:** Explicitly restricting Phase 2 to only the base layout shell and an empty 100dvh viewport container prevented the agent from implementing speculative product features (orders, balances, login flows) in one unreviewable pass.
3. **Mandatory Token Compliance & Pre-Completion Self-Audit:** Forbidding raw hex, RGB, and arbitrary pixel units, coupled with an audit checklist, ensured the agent verified that every style property mapped back to a token in `tokens.css` before reporting completion.
