import { useState, useCallback, useEffect } from 'react';

interface RepoConfig {
  repoFullName: string;
  agent: 'qwen' | 'claude' | 'custom';
  customAgentCommand?: string;
  prompt: string;
  branch: string;
  autoCommit: boolean;
}

interface ConfigureRepositoryModalProps {
  repoFullName: string;
  onClose: () => void;
  onSave: (config: RepoConfig) => void;
}

const DEFAULT_PROMPT = `# Repository Instructions

## Objective
Analyze this repository and provide recommendations for improvement.

## Tasks
1. Review the codebase structure
2. Identify potential bugs or issues
3. Suggest performance optimizations
4. Check for security vulnerabilities
5. Provide actionable recommendations

## Output Format
- Summary of findings
- Priority-ranked issues
- Code snippets where applicable
- Step-by-step implementation guide
`;

export default function ConfigureRepositoryModal({
  repoFullName,
  onClose,
  onSave,
}: ConfigureRepositoryModalProps) {
  const [config, setConfig] = useState<RepoConfig>({
    repoFullName,
    agent: 'qwen',
    prompt: DEFAULT_PROMPT,
    branch: 'main',
    autoCommit: true,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'settings'>('prompt');

  // Load existing config if any
  useEffect(() => {
    const saved = localStorage.getItem(`gitorbit_config_${repoFullName}`);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
  }, [repoFullName]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      localStorage.setItem(
        `gitorbit_config_${repoFullName}`,
        JSON.stringify(config),
      );
      onSave(config);
    } catch {
      // handle save error
    } finally {
      setSaving(false);
    }
  }, [config, repoFullName, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-xl border border-border/60 glass animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Configure Repository
            </h2>
            <p className="text-sm text-text-muted mt-1 font-mono">
              {repoFullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/40 px-6">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'prompt'
                ? 'border-primary text-accent-light'
                : 'border-transparent text-text-muted hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Prompt
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-accent-light'
                : 'border-transparent text-text-muted hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'prompt' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Agent Instructions
                </label>
                <p className="text-xs text-text-muted mb-3">
                  Define what the AI agent should do when executed on this repository.
                  Use markdown formatting for structure.
                </p>
                <textarea
                  value={config.prompt}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, prompt: e.target.value }))
                  }
                  className="w-full h-96 px-4 py-3 rounded-lg border border-border bg-background/80 text-text-primary font-mono text-sm placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Enter your prompt instructions here..."
                  spellCheck={false}
                />
              </div>

              {/* Prompt templates */}
              <div>
                <p className="text-xs text-text-muted mb-2">Quick templates:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        prompt: `# Code Review\n\n## Objective\nPerform a comprehensive code review of this repository.\n\n## Focus Areas\n- Code quality and readability\n- Potential bugs\n- Performance issues\n- Security vulnerabilities\n- Best practices\n\n## Output\nProvide a detailed report with specific recommendations and code examples.`,
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    Code Review
                  </button>
                  <button
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        prompt: `# Bug Fix\n\n## Objective\nIdentify and fix bugs in this repository.\n\n## Tasks\n1. Analyze error logs and stack traces\n2. Identify root causes\n3. Implement fixes\n4. Add regression tests\n5. Document changes\n\n## Output\n- Bug report with severity\n- Fix implementation\n- Test cases added`,
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    Bug Fix
                  </button>
                  <button
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        prompt: `# Feature Implementation\n\n## Objective\nImplement a new feature as specified below.\n\n## Requirements\n[Describe the feature requirements here]\n\n## Tasks\n1. Design the solution\n2. Implement the code\n3. Write tests\n4. Update documentation\n\n## Output\n- Feature implementation\n- Unit tests\n- Documentation updates`,
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    Feature
                  </button>
                  <button
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, prompt: DEFAULT_PROMPT }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    Reset Default
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Agent selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  AI Agent
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: 'qwen',
                      label: 'Qwen Code',
                      desc: 'Open-source, fast, cost-effective',
                    },
                    {
                      value: 'claude',
                      label: 'Claude Code',
                      desc: 'Anthropic&apos;s advanced agent',
                    },
                    {
                      value: 'custom',
                      label: 'Custom',
                      desc: 'Bring your own agent command',
                    },
                  ].map((agent) => (
                    <label
                      key={agent.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        config.agent === agent.value
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border/40 hover:border-primary/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="agent"
                        value={agent.value}
                        checked={config.agent === agent.value}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            agent: e.target.value as RepoConfig['agent'],
                          }))
                        }
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {agent.label}
                        </p>
                        <p className="text-xs text-text-muted">{agent.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom agent command */}
              {config.agent === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Custom Command
                  </label>
                  <input
                    type="text"
                    value={config.customAgentCommand || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        customAgentCommand: e.target.value,
                      }))
                    }
                    placeholder="npx my-agent --prompt '...'"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/80 text-text-primary font-mono text-sm placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              )}

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Target Branch
                </label>
                <input
                  type="text"
                  value={config.branch}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, branch: e.target.value }))
                  }
                  placeholder="main"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/80 text-text-primary font-mono text-sm placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-text-muted mt-2">
                  The agent will create PRs targeting this branch.
                </p>
              </div>

              {/* Auto commit */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCommit}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      autoCommit: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-text-secondary">
                    Auto-commit changes
                  </p>
                  <p className="text-xs text-text-muted">
                    Automatically commit changes and open a pull request
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/40">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all glow-ring"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving&hellip;
              </span>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
