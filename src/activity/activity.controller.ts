import { Controller, Get, Query } from "@nestjs/common";
import { ActivityService } from "./activity.service.js";
import { list } from "../common/api.js";
import { z } from "zod";

const limitQuerySchema = z.coerce.number().int().min(1).max(200).default(50);

@Controller("activity-feed")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  getActivityFeed(@Query("limit") limit: unknown) {
    const parsed = limitQuerySchema.safeParse(limit);
    const safeLimit = parsed.success ? parsed.data : 50;
    const events = this.activityService.findAll(safeLimit);
    return list(events);
  }
}
