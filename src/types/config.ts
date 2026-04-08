import { z } from 'zod';

export const AgentTypeSchema = z.enum(['qwen', 'claude']);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const ConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  stateRepoOwner: z.string().min(1),
  stateRepoName: z.string().default('gitorbit-state'),
  defaultAgentType: AgentTypeSchema.default('qwen'),
  defaultTargetRepo: z.string().nullable().default(null),
  updatedAt: z.string().datetime(),
});

export type Config = z.infer<typeof ConfigSchema>;
