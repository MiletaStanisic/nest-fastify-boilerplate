import { z } from "zod";

export const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  industry: z.string().min(2).optional(),
  contactName: z.string().min(2).optional(),
  contactPhone: z.string().optional(),
});

export type UpdateClientDto = z.infer<typeof updateClientSchema>;
