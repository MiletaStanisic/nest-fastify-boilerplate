import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { DashboardController } from "./dashboard.controller.js";
import { ClientsModule } from "../clients/clients.module.js";

@Module({
  imports: [ClientsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
