import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Minimal auth for the exercise: identifies the caller from the `x-user-id`
 * header, loads the User, and rejects unknown or inactive users. The resolved
 * user is attached to the request and read via the @CurrentUser() decorator.
 *
 * This is the authorization pattern to follow when adding new endpoints.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'] as string | undefined;
    if (!userId) {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Unknown or inactive user');
    }

    request.user = user;
    return true;
  }
}
