import { Body, Controller, Headers, Param, Post } from "@nestjs/common";
import { MilestonesService } from "./milestones.service.js";
import { createMilestoneSchema } from "./dto/create-milestone.dto.js";
import { Roles } from "../common/roles.decorator.js";
import { Role } from "../common/role.enum.js";
import { ok, validateBody } from "../common/api.js";

@Controller("clients/:clientId/milestones")
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager)
  create(
    @Param("clientId") clientId: string,
    @Body() body: unknown,
    @Headers("x-role") role: string,
  ) {
    const dto = validateBody(createMilestoneSchema, body);
    return ok(this.milestonesService.create(clientId, dto, role ?? "unknown"));
  }
}
