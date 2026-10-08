import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '../users/users.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() metadata means this route is not role-restricted.
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user as {
      role?: UserRole;
    } | undefined;

    // SUPER_ADMIN always passes role checks by deliberate design.
    if (user?.role === 'SUPER_ADMIN') {
      return true;
    }

    if (user?.role && requiredRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('Insufficient role');
  }
}