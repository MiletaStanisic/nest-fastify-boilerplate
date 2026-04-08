import { Module } from "@nestjs/common";
import { NotesService } from "./notes.service.js";
import { NotesController } from "./notes.controller.js";
import { ClientsModule } from "../clients/clients.module.js";

@Module({
  imports: [ClientsModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
