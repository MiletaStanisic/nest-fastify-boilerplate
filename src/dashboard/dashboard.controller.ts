import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { ok } from "../common/api.js";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  getSummary() {
    return ok(this.dashboardService.getSummary());
  }
}
