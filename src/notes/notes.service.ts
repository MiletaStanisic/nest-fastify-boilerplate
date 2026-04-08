import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { type Note } from "./note.type.js";
import { type CreateNoteDto } from "./dto/create-note.dto.js";
import { ClientsService } from "../clients/clients.service.js";
import { ActivityService } from "../activity/activity.service.js";

@Injectable()
export class NotesService {
  private readonly notes: Note[] = [];

  constructor(
    private readonly clientsService: ClientsService,
    private readonly activityService: ActivityService,
  ) {}

  create(clientId: string, dto: CreateNoteDto, performedBy: string): Note {
    const client = this.clientsService.findById(clientId);
    const note: Note = {
      id: randomUUID(),
      clientId,
      content: dto.content,
      authorRole: performedBy,
      createdAt: new Date().toISOString(),
    };
    this.notes.push(note);
    this.activityService.record({
      type: "NOTE_ADDED",
      clientId,
      clientName: client.name,
      description: `Note added for ${client.name}`,
      performedBy,
    });
    return note;
  }

  findByClient(clientId: string): Note[] {
    return this.notes.filter((n) => n.clientId === clientId);
  }
}
