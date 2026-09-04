---
name: specdrive
description: Follow this repository's SpecDrive workflow when a feature, compatibility update, or non-trivial maintenance request must be specified, planned, implemented, and validated from files under .specify/. Do not invoke for read-only questions or tiny typo fixes.
---

# SpecDrive workflow

Use `.specify/` as the source of truth for non-trivial changes.

1. Read `.specify/memory/constitution.md`.
2. Select the numbered feature matching the request under `.specify/specs/`.
3. Read `spec.md` for intent and acceptance criteria, `plan.md` for technical
   boundaries, and `tasks.md` for execution order.
4. Stop and surface a conflict when the request, constitution, and feature spec
   cannot all be satisfied. Direct user instructions have precedence, but the
   spec must be updated so the divergence remains visible.
5. Implement only tasks in the selected feature. Do not use an unchecked task
   as permission for unrelated cleanup.
6. Run the validation attached to the task and its acceptance criterion.
7. Mark a checkbox complete only when evidence exists. Record deferred visual
   checks instead of treating static validation as equivalent.
8. Keep README and durable architecture or compatibility docs synchronized.

When no feature exists for substantial work, create
`.specify/specs/NNN-short-name/{spec.md,plan.md,tasks.md}` before implementation.

