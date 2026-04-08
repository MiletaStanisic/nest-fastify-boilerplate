export enum PipelineStage {
  Discovery = "discovery",
  SecurityReview = "security_review",
  Integration = "integration",
  Training = "training",
  GoLive = "go_live",
}

export const ALLOWED_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  [PipelineStage.Discovery]: [PipelineStage.SecurityReview],
  [PipelineStage.SecurityReview]: [PipelineStage.Integration],
  [PipelineStage.Integration]: [PipelineStage.Training],
  [PipelineStage.Training]: [PipelineStage.GoLive],
  [PipelineStage.GoLive]: [],
};

export const ALL_STAGES = Object.values(PipelineStage);
