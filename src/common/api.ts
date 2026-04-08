import { BadRequestException } from "@nestjs/common";
import { type ZodType } from "zod";

export const ok = <T>(data: T) => ({ data });

export const list = <T>(items: T[], total?: number) => ({
  data: items,
  meta: { total: total ?? items.length },
});

export const validateBody = <T>(schema: ZodType<T>, body: unknown): T => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException({
      error: "INVALID_BODY",
      issues: result.error.flatten(),
    });
  }
  return result.data;
};
