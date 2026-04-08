import { z } from 'zod';

export const PromptCategorySchema = z.enum([
  'documentation',
  'refactor',
  'devops',
  'testing',
  'custom',
]);
export type PromptCategory = z.infer<typeof PromptCategorySchema>;

export const PromptTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  templateText: z.string().min(1),
  variables: z.array(z.string()).default([]),
  category: PromptCategorySchema,
  usageCount: z.number().int().nonnegative().default(0),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;
