# Task System

How work proceeds in this repo (solo vibe-coding with Claude Code):
- **One task in progress at a time.** `CURRENT.md` points at the active task file (e.g., `000-foundation.md`).
- Each task file has **Objective**, **Steps**, and **Acceptance criteria** tied to the DoD in `docs/RULES.md`.
- Claude works the task in plan mode -> implement -> verify (`lint`/`typecheck`/`test`/`build`) -> `dod-reviewer` -> STOP.
- **The user commits manually** between tasks. Claude never commits.
- When a task's acceptance criteria pass and the user has committed, update `CURRENT.md` to point at the next task and `/clear`.
- To resume any session: "read docs/tasks/CURRENT.md and continue".
