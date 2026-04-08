import { z } from 'zod';

export const RunStatusSchema = z.enum([
  'queued',
  'dispatched',
  'in_progress',
  'completed',
  'failed',
  'cancelled',
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunSchema = z.object({
  id: z.string().regex(/^run_\d+_[a-f0-9]{8}$/),
  repositoryId: z.string().min(1),
  repositoryFullName: z.string().min(3),
  prompt: z.string().min(1),
  status: RunStatusSchema,
  workflowRunId: z.number().int().positive().nullable().default(null),
  jobId: z.number().int().positive().nullable().default(null),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable().default(null),
  completedAt: z.string().datetime().nullable().default(null),
  commitSha: z.string().regex(/^[a-f0-9]{40}$/).nullable().default(null),
  logUrl: z.string().url().nullable().default(null),
  error: z.string().nullable().default(null),
  agentType: z.string().default('qwen'),
});

export type Run = z.infer<typeof RunSchema>;
