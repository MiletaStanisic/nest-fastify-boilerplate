import "reflect-metadata";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "../src/app.module.js";

let app: NestFastifyApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  await app.close();
});

describe("Nest + Fastify boilerplate", () => {
  it("returns health payload", async () => {
    const response = await request(app.getHttpServer()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok" });
  });

  it("returns validation error for invalid task payload", async () => {
    const response = await request(app.getHttpServer()).post("/tasks").send({ title: "x" });
    expect(response.status).toBe(400);
  });

  it("creates task with valid payload", async () => {
    const response = await request(app.getHttpServer())
      .post("/tasks")
      .send({ title: "Prepare onboarding plan" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Prepare onboarding plan",
      done: false
    });
  });
});
