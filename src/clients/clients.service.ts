import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { type Client } from "./client.type.js";
import { type CreateClientDto } from "./dto/create-client.dto.js";
import { type UpdateClientDto } from "./dto/update-client.dto.js";
import { PipelineStage } from "../onboarding-pipeline/pipeline-stage.enum.js";
import { ActivityService } from "../activity/activity.service.js";

@Injectable()
export class ClientsService {
  private readonly clients: Client[] = [
    {
      id: "client-seed-1",
      name: "Acme Corp",
      email: "contact@acme.com",
      industry: "Technology",
      contactName: "Alice Smith",
      contactPhone: "+1-555-0101",
      stage: PipelineStage.Discovery,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "client-seed-2",
      name: "Globex Inc",
      email: "ops@globex.com",
      industry: "Manufacturing",
      contactName: "Bob Johnson",
      contactPhone: "+1-555-0202",
      stage: PipelineStage.SecurityReview,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "client-seed-3",
      name: "Initech Ltd",
      email: "hello@initech.com",
      industry: "Finance",
      contactName: "Carol White",
      contactPhone: undefined,
      stage: PipelineStage.Integration,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "client-seed-4",
      name: "Umbrella Co",
      email: "corp@umbrella.com",
      industry: "Healthcare",
      contactName: "David Brown",
      contactPhone: "+1-555-0404",
      stage: PipelineStage.Training,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "client-seed-5",
      name: "Vandelay Ind",
      email: "info@vandelay.com",
      industry: "Retail",
      contactName: "Eve Davis",
      contactPhone: "+1-555-0505",
      stage: PipelineStage.GoLive,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];

  constructor(private readonly activityService: ActivityService) {}

  findAll(): Client[] {
    return this.clients;
  }

  findById(id: string): Client {
    const client = this.clients.find((c) => c.id === id);
    if (!client) {
      throw new NotFoundException({ error: "NOT_FOUND", message: `Client ${id} not found` });
    }
    return client;
  }

  create(dto: CreateClientDto, performedBy: string): Client {
    const now = new Date().toISOString();
    const client: Client = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      industry: dto.industry,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      stage: PipelineStage.Discovery,
      createdAt: now,
      updatedAt: now,
    };
    this.clients.push(client);
    this.activityService.record({
      type: "CLIENT_CREATED",
      clientId: client.id,
      clientName: client.name,
      description: `Client "${client.name}" created`,
      performedBy,
    });
    return client;
  }

  update(id: string, dto: UpdateClientDto, performedBy: string): Client {
    const client = this.findById(id);
    Object.assign(client, dto, { updatedAt: new Date().toISOString() });
    this.activityService.record({
      type: "CLIENT_UPDATED",
      clientId: client.id,
      clientName: client.name,
      description: `Client "${client.name}" updated`,
      performedBy,
    });
    return client;
  }

  remove(id: string, performedBy: string): void {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException({ error: "NOT_FOUND", message: `Client ${id} not found` });
    }
    const [removed] = this.clients.splice(index, 1);
    if (removed) {
      this.activityService.record({
        type: "CLIENT_DELETED",
        clientId: removed.id,
        clientName: removed.name,
        description: `Client "${removed.name}" deleted`,
        performedBy,
      });
    }
  }

  updateStage(id: string, stage: PipelineStage): Client {
    const client = this.findById(id);
    client.stage = stage;
    client.updatedAt = new Date().toISOString();
    return client;
  }
}
