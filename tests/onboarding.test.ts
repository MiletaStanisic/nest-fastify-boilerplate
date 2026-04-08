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

// ─── Guard tests ─────────────────────────────────────────────────────────────

describe("RolesGuard — mutation endpoints", () => {
  it("POST /clients without x-role header returns 403", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients")
      .send({ name: "New Co", email: "new@co.com", industry: "Tech", contactName: "Jim" });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ error: "FORBIDDEN" });
  });

  it("POST /clients with member role returns 403 (manager+ required)", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients")
      .set("x-role", "member")
      .send({ name: "New Co", email: "new@co.com", industry: "Tech", contactName: "Jim" });
    expect(res.status).toBe(403);
  });

  it("POST /clients with invalid role value returns 403", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients")
      .set("x-role", "superadmin")
      .send({ name: "New Co", email: "new@co.com", industry: "Tech", contactName: "Jim" });
    expect(res.status).toBe(403);
  });

  it("DELETE /clients/:id with manager role returns 403 (admin only)", async () => {
    const res = await request(app.getHttpServer())
      .delete("/clients/client-seed-1")
      .set("x-role", "manager");
    expect(res.status).toBe(403);
  });

  it("PATCH /pipeline/:id/stage without x-role returns 403", async () => {
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-1/stage")
      .send({ stage: "security_review" });
    expect(res.status).toBe(403);
  });

  it("POST /clients/:id/notes without x-role returns 403", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients/client-seed-1/notes")
      .send({ content: "Some note" });
    expect(res.status).toBe(403);
  });

  it("POST /clients/:id/notes with member role succeeds", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients/client-seed-1/notes")
      .set("x-role", "member")
      .send({ content: "Member note" });
    expect(res.status).toBe(201);
    const body = res.body as { data: { content: string; authorRole: string } };
    expect(body.data).toMatchObject({ content: "Member note", authorRole: "member" });
  });
});

// ─── Client CRUD ─────────────────────────────────────────────────────────────

describe("Clients CRUD", () => {
  let createdClientId: string;

  it("POST /clients with manager role creates a client", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients")
      .set("x-role", "manager")
      .send({
        name: "Test Corp",
        email: "test@corp.com",
        industry: "SaaS",
        contactName: "Test User",
      });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ data: { name: "Test Corp", stage: "discovery" } });
    const body = res.body as { data: { id: string } };
    createdClientId = body.data.id;
  });

  it("GET /clients/:id returns the created client", async () => {
    const res = await request(app.getHttpServer()).get(`/clients/${createdClientId}`);
    expect(res.status).toBe(200);
    const body = res.body as { data: { id: string } };
    expect(body.data.id).toBe(createdClientId);
  });

  it("PATCH /clients/:id with admin role updates the client", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/clients/${createdClientId}`)
      .set("x-role", "admin")
      .send({ industry: "FinTech" });
    expect(res.status).toBe(200);
    const body = res.body as { data: { industry: string } };
    expect(body.data.industry).toBe("FinTech");
  });

  it("GET /clients/:id returns 404 for unknown id", async () => {
    const res = await request(app.getHttpServer()).get("/clients/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("DELETE /clients/:id with admin role succeeds", async () => {
    const res = await request(app.getHttpServer())
      .delete(`/clients/${createdClientId}`)
      .set("x-role", "admin");
    expect(res.status).toBe(204);
  });
});

// ─── Validation errors ───────────────────────────────────────────────────────

describe("DTO validation", () => {
  it("POST /clients with missing required fields returns 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients")
      .set("x-role", "admin")
      .send({ name: "X" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_BODY" });
  });

  it("POST /clients with invalid email returns 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients")
      .set("x-role", "admin")
      .send({ name: "Valid Co", email: "not-an-email", industry: "Tech", contactName: "Alice" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_BODY" });
  });

  it("PATCH /pipeline/:id/stage with invalid stage value returns 400", async () => {
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-1/stage")
      .set("x-role", "admin")
      .send({ stage: "not_a_stage" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_BODY" });
  });

  it("POST /clients/:id/milestones with short title returns 400", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients/client-seed-1/milestones")
      .set("x-role", "manager")
      .send({ title: "hi" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_BODY" });
  });
});

// ─── Stage transition tests ──────────────────────────────────────────────────

describe("Pipeline stage transitions", () => {
  it("allows valid transition: discovery → security_review", async () => {
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-1/stage")
      .set("x-role", "admin")
      .send({ stage: "security_review" });
    expect(res.status).toBe(200);
    const body = res.body as { data: { stage: string } };
    expect(body.data.stage).toBe("security_review");
  });

  it("rejects skipping a stage: security_review → training (not allowed)", async () => {
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-2/stage")
      .set("x-role", "admin")
      .send({ stage: "training" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_TRANSITION" });
  });

  it("rejects backward transition: integration → discovery", async () => {
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-3/stage")
      .set("x-role", "manager")
      .send({ stage: "discovery" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_TRANSITION" });
  });

  it("rejects transition from terminal stage: go_live → any", async () => {
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-5/stage")
      .set("x-role", "admin")
      .send({ stage: "training" });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "INVALID_TRANSITION" });
  });

  it("allows valid transition: security_review → integration", async () => {
    // client-seed-2 is at security_review (seed default)
    const res = await request(app.getHttpServer())
      .patch("/pipeline/client-seed-2/stage")
      .set("x-role", "admin")
      .send({ stage: "integration" });
    expect(res.status).toBe(200);
    const body = res.body as { data: { stage: string } };
    expect(body.data.stage).toBe("integration");
  });
});

// ─── Milestones ──────────────────────────────────────────────────────────────

describe("Milestones", () => {
  it("POST /clients/:id/milestones creates a milestone", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients/client-seed-1/milestones")
      .set("x-role", "manager")
      .send({ title: "Sign legal agreement", description: "NDA + MSA" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      data: { title: "Sign legal agreement", completed: false, clientId: "client-seed-1" },
    });
  });

  it("POST /clients/:id/milestones returns 404 for unknown client", async () => {
    const res = await request(app.getHttpServer())
      .post("/clients/unknown-client/milestones")
      .set("x-role", "manager")
      .send({ title: "Some milestone" });
    expect(res.status).toBe(404);
  });
});
