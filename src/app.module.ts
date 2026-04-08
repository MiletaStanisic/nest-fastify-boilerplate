import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AuthModule } from "./auth/auth.module.js";
import { ActivityModule } from "./activity/activity.module.js";
import { ClientsModule } from "./clients/clients.module.js";
import { PipelineModule } from "./onboarding-pipeline/pipeline.module.js";
import { MilestonesModule } from "./milestones/milestones.module.js";
import { NotesModule } from "./notes/notes.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { PrismaModule } from "./db/prisma.module.js";

@Module({
  imports: [
    AuthModule,
    ActivityModule,
    ClientsModule,
    PipelineModule,
    MilestonesModule,
    NotesModule,
    DashboardModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
