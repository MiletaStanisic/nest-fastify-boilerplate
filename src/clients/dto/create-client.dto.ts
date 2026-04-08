import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  industry: z.string().min(2),
  contactName: z.string().min(2),
  contactPhone: z.string().optional(),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;
