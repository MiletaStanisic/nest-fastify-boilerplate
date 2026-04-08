import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { env } from "./config/env.js";
import { getOpenApiDocument, getSwaggerHtml } from "./docs/openapi.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const fastify = app.getHttpAdapter().getInstance();
  const openApiDocument = getOpenApiDocument(env.PORT);

  fastify.get("/openapi.json", () => openApiDocument);
  fastify.get("/docs", (_request, reply) => {
    return reply.type("text/html").send(getSwaggerHtml());
  });

  await app.listen(env.PORT, "0.0.0.0");
}

void bootstrap();
