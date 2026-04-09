# GitOrbit — Improved Master Prompt

> A zero-backend static web control plane to manage GitHub repositories and orchestrate an autonomous AI coding agent, deployed at `gitorbit-k.oriz.in`.

---

## ROLE

Act as a Principal Cloud Architect and Lead Frontend Developer. Build "GitOrbit" — a 100% static, client-side only web control plane with absolutely ZERO backend server.web search everything 10 times using different mcp servers

---

## STRICT TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| **Core Framework** | Astro (static output), deployed to Cloudflare Pages |
| **UI Framework** | React (via `@astrojs/react`). Complex interactive components must be isolated as Astro Islands (`client:only="react"` or `client:load`) |
| **Styling & Components** | Tailwind CSS + `shadcn/ui`. Dark mode default, monospace fonts for logs |
| **Authentication** | BYOT (Bring Your Own Token). User inputs a GitHub PAT into a React component, stored in browser `localStorage` |
| **State Storage** | A dedicated public GitHub repository. The React frontend acts as the ORM, reading/writing state as **sharded JSON files** via direct client-side `fetch` calls to the GitHub REST API using the PAT |
| **AI Agent** | Qwen Code CLI (`@anthropic-ai/claude-code` / `@qwen-code/qwen-code@latest`) — **pluggable agent architecture** |
| **Compute Orchestrator** | GitHub Actions (free tier runners) |
| **Log Streaming** | Client-side polling via the **GitHub Jobs API** (`/actions/jobs/{job_id}/logs`) for live plain-text log streaming |

---

## GITHUB PAT SCOPES REQUIRED

### Classic PAT
- `repo` — full control of repositories (read/write contents, dispatch workflows)
- `workflow` — update/trigger GitHub Actions workflows via `workflow_dispatch`

### Fine-Grained PAT (Recommended)
| Permission | Access |
|---|---|
| Repository: Contents | Read & Write |
| Repository: Actions | Read & Write |
| Repository: Workflows | Read & Write |
| Repository: Metadata | Read |

---

## SUBAGENT ARCHITECTURE

This project MUST be built using **10 specialized subagents** executing in maximum parallelism. Each agent has a single responsibility. The orchestration is defined below.

### Subagent Definitions

Create or update according to the best practices and latest everything web search everything 10 times using different mcp servers and query these files under `.qwen/agents/`:web search everything 10 times using different mcp servers

#### 1. `astro-react-architect.md`
**Role**: Project scaffolding, Astro config, page structure, React island boundaries, View Transitions setup.
**Owns**: `astro.config.mjs`, `src/pages/`, `src/layouts/`, `tsconfig.json`, `package.json`

#### 2. `shadcn-tailwind-stylist.md`
**Role**: Design system, Tailwind config, all `shadcn/ui` component installations, dark mode theming, typography, animations.
**Owns**: `tailwind.config.mjs`, `src/components/ui/`, `src/styles/`, `globals.css`

#### 3. `byot-security-guard.md`
**Role**: Token input UI, `useGitHubAuth` hook, `localStorage` read/write, authenticated `fetch` wrapper, token validation flow, route guards.
**Owns**: `src/hooks/useGitHubAuth.ts`, `src/lib/github-client.ts`, `src/components/auth/`

#### 4. `json-schema-designer.md`
**Role**: TypeScript interfaces for all state, JSON schema design, sharded file structure, concurrency-safe read-modify-write utilities with SHA-based optimistic locking and 409-retry logic.
**Owns**: `src/types/`, `src/lib/state-manager.ts`, `src/lib/concurrency.ts`

#### 5. `github-rest-orm.md`
**Role**: Full GitHub REST API client — CRUD for repos, dispatching `workflow_dispatch`, reading workflow runs/jobs, Contents API for state files, pagination handling, rate-limit awareness.
**Owns**: `src/lib/github-api.ts`, `src/lib/repos.ts`, `src/lib/workflows.ts`, `src/lib/contents.ts`

#### 6. `actions-orchestrator.md`
**Role**: The complete GitHub Actions `.yml` workflow — checkout, Node.js setup, pluggable AI agent install, headless execution, commit/push, log capture.
**Owns**: `.github/workflows/gitorbit-agent.yml`, `src/lib/agent-config.ts`

#### 7. `qwen-yolo-executor.md`
**Role**: Pluggable AI agent abstraction — `AgentConfig` interface supporting Qwen Code, Claude Code, or any CLI agent. Install command, binary name, prompt flag, headless flag as config.
**Owns**: `src/types/agent.ts`, `src/lib/agents/qwen.ts`, `src/lib/agents/claude.ts`, `src/lib/agents/base.ts`

#### 8. `log-stream-poller.md`
**Role**: Live log streaming React component — polls GitHub **Jobs API** (`GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs`) for plain-text logs, renders in terminal-style window, auto-scrolls, stops on job completion. Falls back to reading `.gitorbit/logs/` from repo for archived logs.
**Owns**: `src/components/LogViewer.tsx`, `src/hooks/useLogPoller.ts`, `src/lib/log-parser.ts`

#### 9. `edge-case-tester.md`
**Role**: Writes comprehensive tests — token validation edge cases, 409 conflict retries, rate limiting, empty states, concurrent writes, malformed JSON recovery, network failures.
**Owns**: `src/__tests__/`, `vitest.config.ts`

#### 10. `gitorbit-documenter.md`
**Role**: README, legal pages (Privacy Policy, Terms, Cookie Policy), SEO meta tags, `ads.txt`, architecture diagrams, setup guide.
**Owns**: `README.md`, `public/ads.txt`, `src/pages/privacy.astro`, `src/pages/terms.astro`

---

### Subagent Execution Order (Maximum Parallelism)web search everything 10 times using different mcp servers

```
PHASE 1 — Foundation (all parallel)
├── astro-react-architect    → scaffold project, pages, config
├── shadcn-tailwind-stylist  → design system, component library
├── json-schema-designer     → TypeScript types, state schemas
├── qwen-yolo-executor       → agent abstraction interfaces
└── gitorbit-documenter      → README, legal pages, SEO

PHASE 2 — Core Logic (all parallel, depends on Phase 1)
├── byot-security-guard      → auth hooks, token UI (needs: architect + stylist)
├── github-rest-orm          → API client layer (needs: schemas)
├── actions-orchestrator     → workflow YAML (needs: agent abstraction)
└── log-stream-poller        → log viewer component (needs: architect + stylist + ORM)

PHASE 3 — Integration (sequential)
└── Assemble all islands into pages, wire routing, end-to-end flow

PHASE 4 — Quality (parallel)
├── edge-case-tester         → comprehensive test suite
└── gitorbit-documenter      → final README update, walkthrough
```

---

## REQUIRED DELIVERABLESweb search everything 10 times using different mcp servers

### 1. High-Level Architecture & Data Flow

Provide a text-based architecture diagram showing:
- Astro static shell → React interactive islands
- Browser `localStorage` (PAT storage)
- Client-side `fetch` → GitHub REST API (`api.github.com`)
- GitHub Actions (compute via `workflow_dispatch`)
- State repo (sharded JSON files)

**Data flow for submitting an AI prompt**:
1. User types prompt in React component
2. Frontend writes a new `runs/{run_id}.json` to the state repo via Contents API (with SHA for concurrency)
3. Frontend dispatches `workflow_dispatch` on the target repo, passing `run_id` + prompt as inputs
4. GitHub Actions runner picks up the job, installs the AI agent, runs headless
5. Frontend polls `GET /repos/{owner}/{repo}/actions/runs` to find the triggered run
6. Frontend polls `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` to get job IDs
7. Frontend polls `GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs` for **live plain-text logs**
8. Frontend renders logs in terminal-style `<LogViewer>` component
9. Agent commits changes, workflow completes
10. Frontend updates `runs/{run_id}.json` status to `completed`

### 2. Security & Token Handling

- `useGitHubAuth` React hook with `localStorage` get/set/clear
- Authenticated `fetch` wrapper attaching `Authorization: Bearer <PAT>` header
- Token validation on entry: call `GET /user` to verify token works, display username + avatar
- Route guard pattern: redirect to token input page if no valid PAT

### 3. State Schema (Sharded JSON Files)

**File structure in state repo:**
```
gitorbit-state/
├── config.json              # Global config, agent preferences
├── repositories/
│   ├── {repo_id_1}.json     # Individual repo metadata
│   ├── {repo_id_2}.json
│   └── ...
├── runs/
│   ├── {run_id_1}.json      # Individual run record
│   ├── {run_id_2}.json
│   └── ...
└── prompts/
    ├── {prompt_id_1}.json   # Reusable prompt templates
    └── ...
```

**TypeScript interfaces:**

```typescript
// repositories/{id}.json
interface ManagedRepository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  addedAt: string; // ISO 8601
  lastRunId?: string;
  agentConfig?: AgentConfig;
}

// runs/{id}.json
interface AgentRun {
  id: string;
  repositoryId: string;
  repositoryFullName: string;
  prompt: string;
  status: 'queued' | 'dispatched' | 'in_progress'
    | 'completed' | 'failed' | 'cancelled';
  workflowRunId?: number;
  jobId?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  commitSha?: string;
  logUrl?: string;
  error?: string;
  agentType: string; // 'qwen' | 'claude' | custom
}

// Pluggable agent config
interface AgentConfig {
  type: string;
  npmPackage: string;
  binaryName: string;
  promptFlag: string;
  headlessFlag: string;
  installCommand: string;
  executeCommand: (prompt: string) => string;
}
```

**Concurrency handling:**
- Every write uses the Contents API `sha` parameter as an optimistic lock
- On 409 Conflict: re-fetch the file, merge changes, retry (max 3 retries)
- Sharded files (one file per entity) minimize contention vs. single `runs.json`

### 4. GitHub Actions Workflow (Production-Ready)

```yaml
name: GitOrbit AI Agent
on:
  workflow_dispatch:
    inputs:
      run_id:
        description: 'GitOrbit run ID'
        required: true
      prompt:
        description: 'AI prompt to execute'
        required: true
      agent_type:
        description: 'Agent type (qwen|claude)'
        required: false
        default: 'qwen'
      state_repo:
        description: 'State repository (owner/repo)'
        required: true

jobs:
  execute-agent:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout target repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install AI Agent
        run: |
          if [ "${{ inputs.agent_type }}" = "claude" ]; then
            npm install -g @anthropic-ai/claude-code@latest
            AGENT_BIN="claude"
            AGENT_FLAGS="-p --yes"
          else
            npm install -g @qwen-code/qwen-code@latest
            AGENT_BIN="qwen"
            AGENT_FLAGS="-p --yolo"
          fi
          echo "AGENT_BIN=$AGENT_BIN" >> $GITHUB_ENV
          echo "AGENT_FLAGS=$AGENT_FLAGS" >> $GITHUB_ENV

      - name: Update run status to in_progress
        run: |
          # Update state repo run file
          curl -s -X PUT \
            -H "Authorization: Bearer ${{ secrets.GITHUB_TOKEN }}" \
            -H "Accept: application/vnd.github+json" \
            "https://api.github.com/repos/${{ inputs.state_repo }}/contents/runs/${{ inputs.run_id }}.json" \
            -d "$(jq -n --arg status 'in_progress' --arg started "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '{message: "Update run status", content: ({status: $status, startedAt: $started} | @base64)}')" || true

      - name: Execute AI Agent
        run: |
          set -o pipefail
          mkdir -p .gitorbit/logs
          $AGENT_BIN $AGENT_FLAGS "${{ inputs.prompt }}" 2>&1 | tee .gitorbit/logs/${{ inputs.run_id }}.log
        env:
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Commit and push changes
        run: |
          git config user.name "GitOrbit Agent"
          git config user.email "gitorbit[bot]@users.noreply.github.com"
          git add -A
          git diff --staged --quiet || git commit -m "feat(gitorbit): ${{ inputs.prompt }}" -m "Run ID: ${{ inputs.run_id }}" -m "Agent: ${{ inputs.agent_type }}"
          git push

      - name: Save execution logs
        if: always()
        run: |
          git add .gitorbit/logs/ || true
          git diff --staged --quiet || git commit -m "logs(gitorbit): run ${{ inputs.run_id }}"
          git push || true
```

### 5. Live Log Streaming (Jobs API Pattern)

The log streaming component MUST use this flow:

```
1. Dispatch workflow_dispatch → get 204 (no run_id returned)
2. Poll GET /repos/{owner}/{repo}/actions/runs?event=workflow_dispatch
   → Find the run matching our dispatch time (within 30s window)
   → Extract run_id
3. Poll GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs
   → Get job_id and job status
4. Poll GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs
   → Returns 302 redirect to plain-text log URL
   → Follow redirect, parse text
5. Render in <LogViewer> with ANSI color support
6. Stop polling when job status === 'completed'

Polling interval: 3 seconds while in_progress, 10 seconds while queued
Fallback: Read .gitorbit/logs/{run_id}.log from repo via Contents API
```

### 6. Astro Page Structure

```
src/pages/
├── index.astro           # Static landing page (no JS, pure Astro + Tailwind)
├── dashboard.astro       # Authenticated dashboard shell
│   └── <DashboardApp client:only="react" />  # Single React island
├── privacy.astro         # Static legal page
├── terms.astro           # Static legal page
└── 404.astro             # Custom 404

src/components/
├── landing/              # Static landing page components
├── dashboard/            # React dashboard components
│   ├── DashboardApp.tsx  # Root island with client-side router
│   ├── RepoList.tsx
│   ├── RunHistory.tsx
│   ├── NewRun.tsx
│   ├── LogViewer.tsx
│   └── Settings.tsx
├── auth/
│   ├── TokenInput.tsx
│   └── AuthGuard.tsx
└── ui/                   # shadcn/ui components
```

**Routing strategy:**
- Landing page (`/`) → static Astro, zero JS
- Dashboard (`/dashboard`) → single page with `<DashboardApp client:only="react" />` island
- Inside `DashboardApp`: use React Router (hash mode) or a lightweight router for sub-views (`#/repos`, `#/runs`, `#/new-run`, `#/run/{id}`, `#/settings`)
- Astro View Transitions enabled for smooth navigation between landing ↔ dashboard
- Legal pages → static Astro, zero JS

---

## QUALITY REQUIREMENTS

- TypeScript strict mode everywhere
- All state writes use optimistic concurrency (SHA-based, 409 retry)
- Rate-limit aware: respect `X-RateLimit-Remaining` header, show warning at < 100
- Graceful degradation: offline banner, retry buttons, empty states
- Accessible: keyboard navigation, ARIA labels, screen reader support
- Mobile responsive: dashboard usable on tablet/phone
- SEO: proper meta tags, Open Graph, structured data on landing page
web search everything 10 times using different mcp servers