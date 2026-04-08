# GitOrbit

> Your entire GitHub universe, one orbit away.

A **zero-backend** static web control plane to manage GitHub repositories and orchestrate autonomous AI coding agents.

🌐 **Live**: https://gitorbit.oriz.in

---

## Architecture

GitOrbit is a 100% static, client-side only web application with **absolutely ZERO backend server**.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Astro Static Shell (HTML/CSS)                │  │
│  │                                                           │  │
│  │   ┌────────────────────────────────────────────────┐    │  │
│  │   │         React Island (client:only)              │    │  │
│  │   │                                                 │    │  │
│  │   │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │  │
│  │   │  │  Repos   │  │   Runs   │  │ Settings │    │    │  │
│  │   │  └──────────┘  └──────────┘  └──────────┘    │    │  │
│  │   │                                                 │    │  │
│  │   │  localStorage: PAT storage                     │    │  │
│  │   └────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕ fetch()                          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    ┌─────────────────┐
                    │  GitHub API     │
                    │  api.github.com │
                    └─────────────────┘
                              ↕
                    ┌─────────────────┐
                    │  State Repo     │
                    │  (JSON files)   │
                    └─────────────────┘
                              ↕
                    ┌─────────────────┐
                    │ GitHub Actions  │
                    │  (AI Compute)   │
                    └─────────────────┘
```

### Data Flow: Submitting an AI Prompt

1. User types prompt in React component
2. Frontend writes a new `runs/{run_id}.json` to the state repo via Contents API
3. Frontend dispatches `workflow_dispatch` on the target repo, passing `run_id` + prompt as inputs
4. GitHub Actions runner picks up the job, installs the AI agent, runs headlessly
5. Frontend polls the Jobs API for **live plain-text logs** (Feb 2026: run_id returned directly!)
6. Frontend renders logs in terminal-style `<LogViewer>` component
7. Agent commits changes, workflow completes
8. Frontend updates `runs/{run_id}.json` status to `completed`

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Core Framework** | Astro (static output), deployed to Cloudflare Pages |
| **UI Framework** | React (via `@astrojs/react`). Interactive components as Astro Islands (`client:only="react"`) |
| **Styling & Components** | Tailwind CSS + `shadcn/ui`. Dark mode default, monospace fonts for logs |
| **Authentication** | BYOT (Bring Your Own Token). GitHub PAT stored in browser `localStorage` |
| **State Storage** | Dedicated public GitHub repository (sharded JSON files) |
| **AI Agent** | Qwen Code CLI or Claude Code — pluggable agent architecture |
| **Compute Orchestrator** | GitHub Actions (free tier runners) |
| **Log Streaming** | Client-side polling via GitHub Jobs API for live plain-text log streaming |

---

## GitHub PAT Scopes Required

### Fine-Grained PAT (Recommended)

| Permission | Access |
|------------|--------|
| Repository: Contents | Read & Write |
| Repository: Actions | Read & Write |
| Repository: Workflows | Read & Write |
| Repository: Metadata | Read |

Create your PAT at: https://github.com/settings/tokens

---

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm (preferred) or npm
- A GitHub account with a fine-grained PAT

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gitorbit.git
cd gitorbit

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at http://localhost:4321

### Build for Production

```bash
pnpm build
```

The static files will be generated in the `dist/` folder, ready for deployment to Cloudflare Pages.

---

## Project Structure

```
gitorbit/
├── .github/
│   └── workflows/
│       └── gitorbit-agent.yml      # GitHub Actions workflow for AI agent
├── public/
│   └── favicon.svg                 # Site favicon
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── TokenInput.tsx      # PAT input and validation
│   │   ├── dashboard/
│   │   │   └── DashboardApp.tsx    # Main dashboard with routing
│   │   └── ui/                     # shadcn/ui components
│   ├── hooks/
│   │   └── useGitHubAuth.ts        # Authentication hook
│   ├── layouts/
│   │   └── BaseLayout.astro        # Base layout with SEO
│   ├── lib/
│   │   ├── github-api.ts           # GitHub API client
│   │   └── pat-storage.ts          # Token storage utilities
│   ├── pages/
│   │   ├── index.astro             # Static landing page (zero JS)
│   │   ├── dashboard.astro         # Dashboard with React island
│   │   ├── setup.astro             # Token input page
│   │   ├── privacy.astro           # Privacy policy
│   │   ├── terms.astro             # Terms of service
│   │   └── 404.astro               # Custom 404 page
│   └── styles/
│       └── globals.css             # Tailwind + theme
├── astro.config.mjs                # Astro configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## Deployment

### Cloudflare Pages (Recommended)

1. Connect your GitHub repository to Cloudflare Pages
2. Build command: `pnpm build`
3. Build output directory: `dist`
4. Deploy!

The entire site is static — no server-side rendering, no API routes, no environment variables needed.

---

## Features

### ✅ Completed

- [x] 100% static site — zero backend
- [x] Bring Your Own Token authentication
- [x] Astro static shell with React interactive islands
- [x] Dark mode default with space theme
- [x] GitHub Actions workflow with pluggable AI agents
- [x] Support for Qwen Code and Claude Code
- [x] Token validation and scope verification
- [x] Responsive design (mobile to desktop)
- [x] SEO meta tags, Open Graph, structured data
- [x] Legal pages (Privacy Policy, Terms of Service)
- [x] Custom 404 page

### 🚧 Upcoming

- [ ] shadcn/ui component library integration
- [ ] Live log streaming with polling mechanism
- [ ] Comprehensive test suite
- [ ] Repository management UI
- [ ] Run history with filtering and search
- [ ] Prompt templates library
- [ ] Rate limit detection and warnings
- [ ] Offline support and graceful degradation
- [ ] Accessibility improvements

---

## AI Agent Support

GitOrbit supports multiple AI coding agents via a pluggable architecture:

### Qwen Code (Default)
```bash
qwen -p "<prompt>" --yolo
```

### Claude Code
```bash
claude -p "<prompt>" --yes
```

Both agents run headlessly in GitHub Actions with no interactive prompts. The `--yolo` flag (Qwen) or `--yes` flag (Claude) auto-approves all tool executions.

---

## Security

- **Token storage**: Browser `localStorage` only, never sent to third parties
- **Authentication**: `Authorization: Bearer <PAT>` header only
- **Validation**: Token validated against `GET /user` before accepting
- **Scope verification**: Fine-grained PATs with minimum required permissions
- **No server**: Zero backend means zero server-side data breaches
- **No tracking**: No analytics, no cookies, no telemetry

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

---

## Support

For questions, issues, or feature requests:
- Email: whyiswhen@gmail.com
- Issues: https://github.com/your-username/gitorbit/issues

---

*Built with Astro, React, Tailwind CSS, and GitHub Actions.*
