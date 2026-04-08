import { z } from "zod";
import { ALL_STAGES } from "../pipeline-stage.enum.js";

export const updateStageSchema = z.object({
  stage: z.enum(ALL_STAGES as [string, ...string[]]),
});

export type UpdateStageDto = z.infer<typeof updateStageSchema>;
