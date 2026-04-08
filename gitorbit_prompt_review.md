# GitOrbit Prompt Review — Critical Issues & Recommendations

## Verdict: 7 issues found (3 critical, 2 major, 2 minor)

---

## 🔴 CRITICAL Issues (will break the architecture)

### 1. Log Streaming Endpoint Returns a ZIP, Not Text

> [!CAUTION]
> Your prompt says to poll `GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs` and "parse the text logs". This endpoint does **NOT** return text. It returns a **302 redirect to a ZIP archive** of the logs. You cannot simply `fetch()` this and parse text from the response.

**Impact**: The entire Deliverable #5 (Log Polling Component) as described is unimplementable.

**Fix Options** (pick one for the design doc):
- **Option A — Use the Jobs API instead.** Poll `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` to get job status/steps, then `GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs` which returns **plain text** (also via 302 redirect, but to a text file, not zip). This is the correct approach for "live" step-level log streaming.
- **Option B — Download the ZIP after completion only.** Use `JSZip` or similar to decompress the zip in the browser for post-mortem log viewing. Not suitable for "live" polling.
- **Option C — Have the workflow itself write logs to the repo** (as you partially describe in Deliverable #4 with `.gitorbit/logs/`). Then poll the GitHub Contents API for the log file. This gives you true "live" streaming if the workflow `tee`s output to a file and commits/pushes periodically, but it's noisy with many commits.

**Recommendation**: Use **Option A** (Jobs API for live streaming) + **Option C** (repo-committed logs as archive/fallback).

---

### 2. `@qwen-code/qwen-code` — Unverifiable Package & CLI Syntax

> [!CAUTION]
> The package `@qwen-code/qwen-code` does not appear to exist on npmjs.com (returns 403/404). The CLI invocation syntax `qwen -p "<prompt>" --yolo` is also unverifiable — it may have changed or never existed in this form.

**Impact**: Deliverable #4 (the GitHub Actions workflow) is built on an unverifiable CLI tool. If the package name or flags are wrong, the workflow will fail silently.

**Required Actions**:
1. **Verify the exact npm package name** — is it `@anthropic-ai/claude-code`, `@anthropic-ai/claude`, `qwen-coder`, or something else? Search npmjs.com.
2. **Verify the CLI binary name and flags** — is the binary `qwen`, `qwen-code`, or `qwen-coder`? Does `--yolo` exist? Run `npx @qwen-code/qwen-code --help` locally first.
3. **Add a fallback strategy** — the workflow should `npm ls -g` or `which qwen` after install to confirm the CLI is available before running.

**Recommendation**: Make the AI agent **pluggable** in the design. Define an `AgentConfig` interface with `installCommand`, `binaryName`, `promptFlag`, `headlessFlag`. Default to Qwen but design for swappability.

---

### 3. State Repository Race Conditions (No Locking Mechanism)

> [!WARNING]
> Using a public GitHub repo as a "database" by reading/writing JSON files has a fundamental race condition: two browser tabs, devices, or concurrent workflows could read-modify-write `runs.json` simultaneously, causing data loss. The GitHub Contents API's `PUT /repos/{owner}/{repo}/contents/{path}` requires a `sha` parameter, but a stale `sha` will cause a 409 Conflict with no retry logic.

**Impact**: State corruption when multiple sessions are active.

**Required Actions**:
1. **Document optimistic concurrency** using the `sha` field as an ETag — retry on 409 with a fresh GET.
2. **Consider sharding the data model** — instead of one `runs.json`, write individual files like `runs/{run_id}.json`. This eliminates contention on a single file.
3. **Add the retry/conflict logic to the design doc** explicitly.

---

## 🟠 MAJOR Issues (will cause significant pain)

### 4. Public State Repository = Public Prompt History

> [!WARNING]
> You specify a **public** GitHub repository for state storage. This means `runs.json` (containing every AI prompt the user has ever sent, repo names, and execution results) is **publicly visible** to anyone on the internet. This is a significant privacy/security concern.

**Impact**: Exposes the user's full AI agent history, including prompts that may contain sensitive business logic or proprietary code intentions.

**Fix**: Change the spec to a **private** repository. The BYOT PAT can still access private repos. If you want zero-cost, note that GitHub Free accounts get unlimited private repos. Update the prompt to say "dedicated **private** GitHub Repository".

---

### 5. Astro Client-Side Routing Contradiction

> [!IMPORTANT]
> Your prompt asks for "routing handled purely on the client side for the authenticated dashboard without triggering full page reloads." This contradicts Astro's core nature as a **Multi-Page Application (MPA)** framework. Astro navigates between pages with full page loads by default.

**Impact**: Deliverable #6 is architecturally confused.

**Fix Options**:
- **Option A — Use Astro's View Transitions API** (`<ViewTransitions />` in the `<head>`) which provides SPA-like smooth transitions without being a true SPA. Pages still pre-render statically but transitions feel seamless.
- **Option B — Make the entire dashboard a single Astro page** (e.g., `/dashboard.astro`) that renders one giant `client:only="preact"` island. Inside that island, use `preact-router` or `wouter` for client-side sub-routing (e.g., `/dashboard#repos`, `/dashboard#runs`, `/dashboard#new-run`). This is the correct pattern for an authenticated SPA within Astro.
- **Option C — Use Astro's hybrid mode** with `output: 'static'` but hash-based routing within the island.

**Recommendation**: Use **Option B** — a single `/dashboard` page with an island that owns all routing internally via hash routing.

---

## 🟡 MINOR Issues (should be addressed)

### 6. Missing PAT Scope Specification for Fine-Grained Tokens

Your prompt asks for "exact scopes required for the GitHub PAT" but only mentions classic PAT scopes conceptually. GitHub now strongly recommends **Fine-Grained Personal Access Tokens** over classic tokens. The design doc should specify both:

| Classic PAT Scopes | Fine-Grained PAT Permissions |
|---|---|
| `repo` (full control) | Repository: Contents (Read & Write) |
| `workflow` (update workflows) | Repository: Actions (Read & Write) |
| | Repository: Workflows (Read & Write) |
| | Repository: Metadata (Read) |

**Also missing**: The `workflow` scope is **required** to dispatch `workflow_dispatch` events. Your prompt doesn't mention this — without it, the core feature (triggering AI runs) won't work with classic PATs.

---

### 7. `shadcn/ui` + Preact Compatibility Risk

`shadcn/ui` components are designed for React and depend on `react`, `react-dom`, `@radix-ui/*`, and `class-variance-authority`. While `preact/compat` provides React compatibility, Radix UI primitives have historically had edge-case issues with Preact (particularly around `ref` forwarding, `useId`, `useSyncExternalStore`, and React 18+ concurrent features).

**Recommendation**: Add a note in the design doc acknowledging this risk and specify that `shadcn/ui` components should be tested individually during development. Consider having a fallback plan to use `headlessui` or hand-rolled accessible components if Radix breaks under `preact/compat`.

---

## ✅ What's Good About the Prompt

| Aspect | Assessment |
|---|---|
| BYOT architecture | ✅ Excellent — no OAuth flow needed, no backend |
| GitHub API CORS support | ✅ Confirmed — GitHub API returns `Access-Control-Allow-Origin: *` for all origins |
| Astro + Preact Islands | ✅ Sound choice for static-first with interactive pockets |
| `workflow_dispatch` for triggering | ✅ Correct API mechanism |
| Cloudflare Pages deployment | ✅ Perfect for static Astro output |
| Dark mode + monospace logs | ✅ Appropriate UX for a dev tool |

---

## Summary of Required Prompt Changes

1. **Fix log endpoint** → Use Jobs API (`/jobs/{job_id}/logs`) for live text streaming, not run-level zip endpoint
2. **Verify Qwen CLI** → Confirm package name, binary, and flags exist; make agent pluggable
3. **Add concurrency handling** → Shard JSON state files or add 409-retry logic
4. **State repo must be private** → Change "public" to "private" 
5. **Fix routing model** → Use single-page island with hash routing, not "client-side routing across pages"
6. **Add `workflow` scope** → Required for `workflow_dispatch`
7. **Acknowledge shadcn/Preact risk** → Add compatibility testing note
