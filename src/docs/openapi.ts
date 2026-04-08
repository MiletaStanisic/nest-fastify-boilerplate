import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createClientSchema } from "../clients/dto/create-client.dto.js";
import { updateClientSchema } from "../clients/dto/update-client.dto.js";
import { Role } from "../common/role.enum.js";
import { createMilestoneSchema } from "../milestones/dto/create-milestone.dto.js";
import { createNoteSchema } from "../notes/dto/create-note.dto.js";
import { ALL_STAGES } from "../onboarding-pipeline/pipeline-stage.enum.js";
import { updateStageSchema } from "../onboarding-pipeline/dto/update-stage.dto.js";

extendZodWithOpenApi(z);

const roleSchema = z.enum([Role.Admin, Role.Manager, Role.Member]);
const stageSchema = z.enum(ALL_STAGES as [string, ...string[]]);

const idParamSchema = z.object({
  id: z.string()
});

const clientIdParamSchema = z.object({
  clientId: z.string()
});

const roleHeaderSchema = z.object({
  "x-role": roleSchema
});

const errorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.string()
});

const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  industry: z.string(),
  contactName: z.string(),
  contactPhone: z.string().optional(),
  stage: stageSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

const milestoneSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.string()
});

const noteSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  content: z.string(),
  authorRole: z.string(),
  createdAt: z.string()
});

const activityEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  description: z.string(),
  performedBy: z.string(),
  createdAt: z.string()
});

const boardColumnSchema = z.object({
  stage: stageSchema,
  clients: z.array(clientSchema)
});

const dashboardSummarySchema = z.object({
  totalClients: z.number(),
  byStage: z.record(stageSchema, z.number()),
  recentActivity: z.array(activityEventSchema)
});

const okSchema = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({
    data: inner
  });

const listSchema = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({
    data: z.array(inner),
    meta: z.object({
      total: z.number()
    })
  });

const limitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional()
});

function buildRegistry() {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["System"],
    responses: {
      200: {
        description: "Health check",
        content: {
          "application/json": {
            schema: healthSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/clients",
    tags: ["Clients"],
    responses: {
      200: {
        description: "All clients",
        content: {
          "application/json": {
            schema: listSchema(clientSchema)
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/clients/{id}",
    tags: ["Clients"],
    request: {
      params: idParamSchema
    },
    responses: {
      200: {
        description: "Client details",
        content: {
          "application/json": {
            schema: okSchema(clientSchema)
          }
        }
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/clients",
    tags: ["Clients"],
    request: {
      headers: roleHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createClientSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Created client",
        content: {
          "application/json": {
            schema: okSchema(clientSchema)
          }
        }
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/clients/{id}",
    tags: ["Clients"],
    request: {
      params: idParamSchema,
      headers: roleHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: updateClientSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Updated client",
        content: {
          "application/json": {
            schema: okSchema(clientSchema)
          }
        }
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "delete",
    path: "/clients/{id}",
    tags: ["Clients"],
    request: {
      params: idParamSchema,
      headers: z.object({
        "x-role": z.literal(Role.Admin)
      })
    },
    responses: {
      204: {
        description: "Client deleted"
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/pipeline/board",
    tags: ["Pipeline"],
    responses: {
      200: {
        description: "Pipeline board",
        content: {
          "application/json": {
            schema: listSchema(boardColumnSchema)
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "patch",
    path: "/pipeline/{clientId}/stage",
    tags: ["Pipeline"],
    request: {
      params: clientIdParamSchema,
      headers: roleHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: updateStageSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Client stage updated",
        content: {
          "application/json": {
            schema: okSchema(clientSchema)
          }
        }
      },
      400: {
        description: "Validation or transition error",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/clients/{clientId}/milestones",
    tags: ["Milestones"],
    request: {
      params: clientIdParamSchema,
      headers: roleHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createMilestoneSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Milestone created",
        content: {
          "application/json": {
            schema: okSchema(milestoneSchema)
          }
        }
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "post",
    path: "/clients/{clientId}/notes",
    tags: ["Notes"],
    request: {
      params: clientIdParamSchema,
      headers: roleHeaderSchema,
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createNoteSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: "Note created",
        content: {
          "application/json": {
            schema: okSchema(noteSchema)
          }
        }
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      },
      404: {
        description: "Client not found",
        content: {
          "application/json": {
            schema: errorSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/activity-feed",
    tags: ["Activity"],
    request: {
      query: limitQuerySchema
    },
    responses: {
      200: {
        description: "Recent activity",
        content: {
          "application/json": {
            schema: listSchema(activityEventSchema)
          }
        }
      }
    }
  });

  registry.registerPath({
    method: "get",
    path: "/dashboard/summary",
    tags: ["Dashboard"],
    responses: {
      200: {
        description: "Dashboard summary",
        content: {
          "application/json": {
            schema: okSchema(dashboardSummarySchema)
          }
        }
      }
    }
  });

  return registry;
}

const cachedDocuments = new Map<number, ReturnType<OpenApiGeneratorV31["generateDocument"]>>();

export function getOpenApiDocument(port = 4100) {
  const cachedDocument = cachedDocuments.get(port);
  if (cachedDocument) return cachedDocument;

  const registry = buildRegistry();
  const generator = new OpenApiGeneratorV31(registry.definitions);

  const document = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Client Onboarding Console API",
      version: "1.0.0"
    },
    servers: [{ url: `http://localhost:${port}` }]
  });

  cachedDocuments.set(port, document);
  return document;
}

export function getSwaggerHtml(openApiUrl = "/openapi.json") {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Client Onboarding Console API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body{margin:0;background:#fafafa}#swagger-ui{max-width:1200px;margin:0 auto}</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "${openApiUrl}",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;
}
