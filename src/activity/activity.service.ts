import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { type ActivityEvent } from "./activity-event.type.js";

@Injectable()
export class ActivityService {
  private readonly events: ActivityEvent[] = [
    {
      id: "act-seed-1",
      type: "CLIENT_CREATED",
      clientId: "client-seed-1",
      clientName: "Acme Corp",
      description: 'Client "Acme Corp" onboarded',
      performedBy: "admin",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-seed-2",
      type: "STAGE_CHANGED",
      clientId: "client-seed-2",
      clientName: "Globex Inc",
      description: 'Globex Inc moved to stage "security_review"',
      performedBy: "manager",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-seed-3",
      type: "MILESTONE_ADDED",
      clientId: "client-seed-3",
      clientName: "Initech Ltd",
      description: 'Milestone "Integration sign-off" added for Initech Ltd',
      performedBy: "manager",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  record(event: Omit<ActivityEvent, "id" | "createdAt">): ActivityEvent {
    const entry: ActivityEvent = {
      id: randomUUID(),
      ...event,
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(entry);
    return entry;
  }

  findAll(limit = 50): ActivityEvent[] {
    return this.events.slice(0, limit);
  }
}
