import { Injectable } from "@nestjs/common";
import { ClientsService } from "../clients/clients.service.js";
import { ActivityService } from "../activity/activity.service.js";
import { PipelineStage } from "../onboarding-pipeline/pipeline-stage.enum.js";

export type DashboardSummary = {
  totalClients: number;
  byStage: Record<PipelineStage, number>;
  recentActivity: ReturnType<ActivityService["findAll"]>;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly activityService: ActivityService,
  ) {}

  getSummary(): DashboardSummary {
    const clients = this.clientsService.findAll();
    const byStage = Object.values(PipelineStage).reduce(
      (acc, stage) => {
        acc[stage] = clients.filter((c) => c.stage === stage).length;
        return acc;
      },
      {} as Record<PipelineStage, number>,
    );

    return {
      totalClients: clients.length,
      byStage,
      recentActivity: this.activityService.findAll(10),
    };
  }
}
