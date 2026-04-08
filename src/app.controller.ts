import { randomUUID } from "node:crypto";
import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(3)
});

type Task = {
  id: string;
  title: string;
  done: boolean;
};

@Controller()
export class AppController {
  private readonly tasks: Task[] = [
    {
      id: "seed-1",
      title: "Review integration requirements",
      done: false
    }
  ];

  @Get("/health")
  health() {
    return {
      status: "ok",
      service: "backend-nest-fastify-boilerplate"
    };
  }

  @Get("/tasks")
  listTasks() {
    return { items: this.tasks };
  }

  @Post("/tasks")
  createTask(@Body() payload: unknown) {
    const parsed = createTaskSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException({
        error: "INVALID_BODY",
        issues: parsed.error.flatten()
      });
    }

    const task: Task = {
      id: randomUUID(),
      title: parsed.data.title,
      done: false
    };
    this.tasks.unshift(task);

    return task;
  }
}
