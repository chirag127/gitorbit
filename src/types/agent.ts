import { z } from 'zod';

export const AgentConfigSchema = z.object({
  type: z.string(),
  npmPackage: z.string(),
  binaryName: z.string(),
  promptFlag: z.string(),
  headlessFlag: z.string(),
  installCommand: z.string(),
  executeCommand: z.function().args(z.string()).returns(z.string()),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const AGENT_PRESETS: Record<string, Omit<AgentConfig, 'executeCommand'> & { executeCommand: (prompt: string) => string }> = {
  qwen: {
    type: 'qwen',
    npmPackage: '@qwen-code/qwen-code@latest',
    binaryName: 'qwen',
    promptFlag: '-p',
    headlessFlag: '--yolo',
    installCommand: 'npm install -g @qwen-code/qwen-code@latest',
    executeCommand: (prompt: string) => `qwen -p "${prompt}" --yolo`,
  },
  claude: {
    type: 'claude',
    npmPackage: '@anthropic-ai/claude-code@latest',
    binaryName: 'claude',
    promptFlag: '-p',
    headlessFlag: '--yes',
    installCommand: 'npm install -g @anthropic-ai/claude-code@latest',
    executeCommand: (prompt: string) => `claude -p "${prompt}" --yes`,
  },
};

export function getAgentConfig(type: string): Omit<AgentConfig, 'executeCommand'> & { executeCommand: (prompt: string) => string } {
  return AGENT_PRESETS[type] || AGENT_PRESETS.qwen;
}
