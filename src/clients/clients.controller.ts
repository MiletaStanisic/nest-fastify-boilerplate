import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ClientsService } from "./clients.service.js";
import { createClientSchema } from "./dto/create-client.dto.js";
import { updateClientSchema } from "./dto/update-client.dto.js";
import { Roles } from "../common/roles.decorator.js";
import { Role } from "../common/role.enum.js";
import { ok, list, validateBody } from "../common/api.js";

@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll() {
    return list(this.clientsService.findAll());
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return ok(this.clientsService.findById(id));
  }

  @Post()
  @Roles(Role.Admin, Role.Manager)
  create(@Body() body: unknown, @Headers("x-role") role: string) {
    const dto = validateBody(createClientSchema, body);
    return ok(this.clientsService.create(dto, role ?? "unknown"));
  }

  @Patch(":id")
  @Roles(Role.Admin, Role.Manager)
  update(@Param("id") id: string, @Body() body: unknown, @Headers("x-role") role: string) {
    const dto = validateBody(updateClientSchema, body);
    return ok(this.clientsService.update(id, dto, role ?? "unknown"));
  }

  @Delete(":id")
  @HttpCode(204)
  @Roles(Role.Admin)
  remove(@Param("id") id: string, @Headers("x-role") role: string) {
    this.clientsService.remove(id, role ?? "unknown");
  }
}
