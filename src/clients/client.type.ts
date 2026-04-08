import { type PipelineStage } from "../onboarding-pipeline/pipeline-stage.enum.js";

export type Client = {
  id: string;
  name: string;
  email: string;
  industry: string;
  contactName: string;
  contactPhone: string | undefined;
  stage: PipelineStage;
  createdAt: string;
  updatedAt: string;
};
