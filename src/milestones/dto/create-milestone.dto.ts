import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
});

export type CreateMilestoneDto = z.infer<typeof createMilestoneSchema>;
