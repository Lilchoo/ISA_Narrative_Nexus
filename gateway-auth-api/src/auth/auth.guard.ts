import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";
import { PublicKey, RolesKey } from "./auth.metadata";
import { RedisService } from "src/redis/redis.service";
import { StringService } from "src/util/util.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly stringService: StringService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeaders(request);

    if (!token) throw new UnauthorizedException(this.stringService.auth.INVALID_TOKEN);

    const isBlacklisted = await this.redisService.isBlacklistedToken(token);
    if (isBlacklisted) {
      throw new UnauthorizedException(this.stringService.auth.INVALID_TOKEN_BL);
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("JWT_SECRET"),
      });
      request["user"] = payload;
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    return true;
  }

  private extractTokenFromHeaders(request: Request): string | undefined {
    return request.cookies.token;
  }
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(RolesKey, context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return roles.includes(user.role);
  }
}
