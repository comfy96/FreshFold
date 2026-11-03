# task-02-repository-and-scaffold

Repository setup, scaffolding, development diagnostics, and information design for **Fresh Fold Laundry**.

## What this is

This task establishes the foundational engineering setup for Fresh Fold:
- Scaffolding the Next.js App Router codebase from design system tokens and context rules.
- Diagnosing server lifecycle, first load latencies, and deliberate failure modes (nested folder, port conflict, 404).
- Verifying backend persistence vs. "false success" frontend states.
- Structuring Git history, branch graphs, and hand-drawn working tree pipelines.
- Applying information design and typography responsiveness across the application.

## Directory Structure

```
task-02-repository-and-scaffold/
├── README.md                      # Overview of Task 2
├── docs/                          # Written analysis, decision logs, and interviews
│   ├── scaffold-prompt.md         # First draft, final prompt, and evolution
│   ├── model-choices.md           # Model trade-offs and selection rationale
│   ├── performance-note.md        # First load metrics and latency analysis
│   ├── false-success.md           # Database disconnection and frontend illusion analysis
│   ├── readme-test.md             # Real-user onboarding test verbatim
│   ├── working-tree.md            # Git pipeline and branch isolation mechanics
│   ├── information-design.md      # Head/body design adjustments and responsive clamp
│   ├── defects.md                 # Defect register with file references
│   └── interview-answers.md       # Answers to the 15 interview defense questions
└── evidence/                      # Machine-specific evidence files
    ├── 01-agent-plan.txt          # Agent plan and assumptions captured prior to execution
    ├── 02-files-created.txt       # Flat inventory of scaffolded files
    ├── 03-server-start.txt        # Server start logs with PID and port
    ├── 04-first-load.txt          # Cold load HTTP status and latency in ms
    ├── 05-nested-folder-error.txt # Recreated nested directory execution failure
    ├── 06-nested-folder-fixed.txt # Recovery logs and rescaffold in place
    ├── 07-port-conflict.txt       # Port collision terminal logs
    ├── 08-port-conflict-resolved.txt # Port inspection (lsof/kill) and clean restart
    ├── 09-404-error.txt           # 404 route failure log
    ├── 10-404-resolved.txt        # Diagnostic order and resolution
    ├── 11-write-succeeded-logs.txt# Server logs with HTTP 201 verification
    ├── 12-database-rows.png       # Database inspector screenshots showing timestamps
    ├── 13-write-failed-logs.txt   # DB disconnected failure logs
    ├── 14-working-tree-drawing.jpg# Hand-drawn pipeline with handwriting and date
    ├── 15-git-log-graph.txt       # Git graph with branch merges and unmerged deletions
    ├── 16-head-route-one.png      # Route 1 dynamic head title and meta
    ├── 17-head-route-two.png      # Route 2 dynamic head title and meta
    ├── 18-heading-wrap-bad.png    # Unconstrained heading wrap
    ├── 19-heading-wrap-good.png   # Constrained deliberate heading wrap
    └── 20-responsive-three-widths.png # CSS clamp responsive verification across 3 widths
```
