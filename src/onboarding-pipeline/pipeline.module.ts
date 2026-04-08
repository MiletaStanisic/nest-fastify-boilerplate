import { Module } from "@nestjs/common";
import { PipelineService } from "./pipeline.service.js";
import { PipelineController } from "./pipeline.controller.js";
import { ClientsModule } from "../clients/clients.module.js";

@Module({
  imports: [ClientsModule],
  controllers: [PipelineController],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
