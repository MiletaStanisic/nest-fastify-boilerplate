import "reflect-metadata";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "../src/app.module.js";

let app: NestFastifyApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  await app.close();
});

describe("Client Onboarding Console — smoke", () => {
  it("GET /health returns ok", async () => {
    const response = await request(app.getHttpServer()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", service: "client-onboarding-console" });
  });

  it("GET /clients returns paginated list", async () => {
    const response = await request(app.getHttpServer()).get("/clients");
    expect(response.status).toBe(200);
    const body = response.body as { data: unknown[]; meta: { total: number } };
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.meta.total).toBe("number");
  });

  it("GET /pipeline/board returns board columns", async () => {
    const response = await request(app.getHttpServer()).get("/pipeline/board");
    expect(response.status).toBe(200);
    const body = response.body as { data: { stage: string }[] };
    expect(Array.isArray(body.data)).toBe(true);
    const stages = body.data.map((col) => col.stage);
    expect(stages).toContain("discovery");
    expect(stages).toContain("go_live");
  });

  it("GET /dashboard/summary returns summary", async () => {
    const response = await request(app.getHttpServer()).get("/dashboard/summary");
    expect(response.status).toBe(200);
    const body = response.body as { data: { totalClients: number; byStage: object; recentActivity: unknown[] } };
    expect(typeof body.data.totalClients).toBe("number");
    expect(typeof body.data.byStage).toBe("object");
    expect(Array.isArray(body.data.recentActivity)).toBe(true);
  });

  it("GET /activity-feed returns activity list", async () => {
    const response = await request(app.getHttpServer()).get("/activity-feed");
    expect(response.status).toBe(200);
    const body = response.body as { data: unknown[] };
    expect(Array.isArray(body.data)).toBe(true);
  });
});
