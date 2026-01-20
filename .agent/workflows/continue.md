---
description: Main continuation workflow - run this to continue development across sessions
---

# 🌱 Idea Garden - Continuation Workflow

This is the **master orchestration workflow**. When the user says "continue", follow these steps:

## Step 1: Read Current State

1. Read the implementation plan: `cat /home/ana/Code/ideagarden/PLAN.md`
2. Read the current status: `cat /home/ana/Code/ideagarden/STATUS.md`
3. Read any blockers: `cat /home/ana/Code/ideagarden/BLOCKERS.md`

## Step 2: Identify Next Task

Look at `STATUS.md` for the current phase and next uncompleted task. Tasks are marked:
- `[ ]` = Not started
- `[~]` = In progress
- `[x]` = Complete
- `[!]` = Blocked

Find the first `[ ]` or `[~]` task in the current phase.

## Step 3: Execute Task

Based on the task type, run the appropriate sub-workflow:

| Task Type | Workflow File |
|-----------|---------------|
| Setup/Config | `.agent/workflows/setup.md` |
| Backend/API | `.agent/workflows/backend.md` |
| Frontend/UI | `.agent/workflows/frontend.md` |
| Database | `.agent/workflows/database.md` |
| Testing | `.agent/workflows/testing.md` |
| Telegram Bot | `.agent/workflows/telegram.md` |
| Deployment | `.agent/workflows/deploy.md` |

## Step 4: Update Status

After completing a task:
1. Mark the task as `[x]` in `STATUS.md`
2. Update `CHANGELOG.md` with what was done
3. If blocked, update `BLOCKERS.md` and mark task as `[!]`

## Step 5: Commit Progress

// turbo
```bash
cd /home/ana/Code/ideagarden && git add -A && git commit -m "Progress: [brief description of what was done]"
```

## Step 6: Report & Continue

Report to the user:
- What was completed
- Current phase progress (e.g., "Phase 1: 3/5 tasks complete")
- What's next
- Any blockers

If user says "continue", repeat from Step 1.

---

## Quick Commands

| Command | Action |
|---------|--------|
| "continue" | Run this workflow |
| "status" | Show STATUS.md summary |
| "blockers" | Show BLOCKERS.md |
| "reset" | Reset a blocked task |
| "skip" | Skip current task, move to next |
| "phase X" | Jump to phase X |
