import { z } from 'zod';

export const RepositorySchema = z.object({
  id: z.string().min(1),
  owner: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
  defaultBranch: z.string().default('main'),
  addedAt: z.string().datetime(),
  lastRunId: z.string().nullable().default(null),
  agentConfig: z.object({
    type: z.string(),
    npmPackage: z.string(),
    binaryName: z.string(),
    promptFlag: z.string(),
    headlessFlag: z.string(),
  }).nullable().default(null),
});

export type Repository = z.infer<typeof RepositorySchema>;
