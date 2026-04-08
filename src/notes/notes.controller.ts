import { Body, Controller, Headers, Param, Post } from "@nestjs/common";
import { NotesService } from "./notes.service.js";
import { createNoteSchema } from "./dto/create-note.dto.js";
import { Roles } from "../common/roles.decorator.js";
import { Role } from "../common/role.enum.js";
import { ok, validateBody } from "../common/api.js";

@Controller("clients/:clientId/notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager, Role.Member)
  create(
    @Param("clientId") clientId: string,
    @Body() body: unknown,
    @Headers("x-role") role: string,
  ) {
    const dto = validateBody(createNoteSchema, body);
    return ok(this.notesService.create(clientId, dto, role ?? "unknown"));
  }
}
