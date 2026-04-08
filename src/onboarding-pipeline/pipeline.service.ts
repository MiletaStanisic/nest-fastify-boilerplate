import { BadRequestException, Injectable } from "@nestjs/common";
import { ClientsService } from "../clients/clients.service.js";
import { ActivityService } from "../activity/activity.service.js";
import { ALLOWED_TRANSITIONS, PipelineStage } from "./pipeline-stage.enum.js";
import { type Client } from "../clients/client.type.js";

export type BoardColumn = {
  stage: PipelineStage;
  clients: Client[];
};

@Injectable()
export class PipelineService {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly activityService: ActivityService,
  ) {}

  getBoard(): BoardColumn[] {
    const clients = this.clientsService.findAll();
    return Object.values(PipelineStage).map((stage) => ({
      stage,
      clients: clients.filter((c) => c.stage === stage),
    }));
  }

  advanceStage(clientId: string, targetStage: PipelineStage, performedBy: string): Client {
    const client = this.clientsService.findById(clientId);
    const allowed = ALLOWED_TRANSITIONS[client.stage];

    if (!allowed.includes(targetStage)) {
      throw new BadRequestException({
        error: "INVALID_TRANSITION",
        message: `Cannot transition from "${client.stage}" to "${targetStage}". Allowed: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal stage)"}`,
      });
    }

    const fromStage = client.stage;
    const updated = this.clientsService.updateStage(clientId, targetStage);
    this.activityService.record({
      type: "STAGE_CHANGED",
      clientId: client.id,
      clientName: client.name,
      description: `"${client.name}" moved from "${fromStage}" to "${targetStage}"`,
      performedBy,
    });
    return updated;
  }
}
