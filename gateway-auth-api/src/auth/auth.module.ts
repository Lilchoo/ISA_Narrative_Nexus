import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { RedisModule } from "src/redis/redis.module";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    JwtModule.register({ global: true }),
    UserModule,
    RedisModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
