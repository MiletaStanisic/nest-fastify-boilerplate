import { Body, Controller, Get, Headers, Param, Patch } from "@nestjs/common";
import { PipelineService } from "./pipeline.service.js";
import { updateStageSchema } from "./dto/update-stage.dto.js";
import { PipelineStage } from "./pipeline-stage.enum.js";
import { Roles } from "../common/roles.decorator.js";
import { Role } from "../common/role.enum.js";
import { ok, list, validateBody } from "../common/api.js";

@Controller("pipeline")
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get("board")
  getBoard() {
    return list(this.pipelineService.getBoard());
  }

  @Patch(":clientId/stage")
  @Roles(Role.Admin, Role.Manager)
  updateStage(
    @Param("clientId") clientId: string,
    @Body() body: unknown,
    @Headers("x-role") role: string,
  ) {
    const dto = validateBody(updateStageSchema, body);
    return ok(this.pipelineService.advanceStage(clientId, dto.stage as PipelineStage, role ?? "unknown"));
  }
}
