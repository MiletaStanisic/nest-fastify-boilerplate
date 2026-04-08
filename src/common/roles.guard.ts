import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator.js";
import { Role } from "./role.enum.js";

type HttpRequest = {
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<HttpRequest>();
    const rawRole = request.headers["x-role"];
    const roleStr = Array.isArray(rawRole) ? rawRole[0] : rawRole;
    const role = roleStr as Role | undefined;

    if (!role || !Object.values(Role).includes(role) || !requiredRoles.includes(role)) {
      throw new ForbiddenException({
        error: "FORBIDDEN",
        message: `Required role: ${requiredRoles.join(" | ")}`,
      });
    }

    return true;
  }
}
