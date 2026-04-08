import { Module } from "@nestjs/common";
import { MilestonesService } from "./milestones.service.js";
import { MilestonesController } from "./milestones.controller.js";
import { ClientsModule } from "../clients/clients.module.js";

@Module({
  imports: [ClientsModule],
  controllers: [MilestonesController],
  providers: [MilestonesService],
})
export class MilestonesModule {}
