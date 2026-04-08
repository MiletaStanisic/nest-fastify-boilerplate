import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { type Milestone } from "./milestone.type.js";
import { type CreateMilestoneDto } from "./dto/create-milestone.dto.js";
import { ClientsService } from "../clients/clients.service.js";
import { ActivityService } from "../activity/activity.service.js";

@Injectable()
export class MilestonesService {
  private readonly milestones: Milestone[] = [];

  constructor(
    private readonly clientsService: ClientsService,
    private readonly activityService: ActivityService,
  ) {}

  create(clientId: string, dto: CreateMilestoneDto, performedBy: string): Milestone {
    const client = this.clientsService.findById(clientId);
    const milestone: Milestone = {
      id: randomUUID(),
      clientId,
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.milestones.push(milestone);
    this.activityService.record({
      type: "MILESTONE_ADDED",
      clientId,
      clientName: client.name,
      description: `Milestone "${dto.title}" added for ${client.name}`,
      performedBy,
    });
    return milestone;
  }

  findByClient(clientId: string): Milestone[] {
    return this.milestones.filter((m) => m.clientId === clientId);
  }
}
