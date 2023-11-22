import { Body, Controller, Get, Post, Req, Param } from "@nestjs/common";
import { Request } from "express";
import { UserService } from "./user.service";
import { RegisterDto } from "./dtos/register.dto";
import { Public } from "src/auth/auth.metadata";
import { ApiTags } from "@nestjs/swagger";
import { EndpointService } from "src/endpoint/endpoint.service";
import { HttpMethod } from "@prisma/client";
import { RequestCountDto } from "./dtos/requestCount.dto";
import { StringService } from "src/util/util.service";

@ApiTags("User")
@Controller({
  path: "user",
  version: "1",
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly endpointService: EndpointService,
    private readonly stringService: StringService,
  ) {}

  @Public()
  @Post("register")
  register(@Req() req: Request, @Body() registerDto: RegisterDto) {
    console.log(registerDto);

    this.endpointService.updateEndpointCounter({
      method: HttpMethod[req.method],
      name: req.path,
    });

    this.userService.updateRequestCounter({
      username: registerDto.username,
    });

    return this.userService.createUser(registerDto);
  }

  @Get("getallusers")
  async getAllUsers(@Req() req: Request) {
    this.endpointService.updateEndpointCounter({
      method: HttpMethod[req.method],
      name: req.path,
    });

    this.userService.updateRequestCounter({
      username: req["user"].username,
    });

    return this.userService.getAllUsers();
  }

  async updateRequestCounter(
    @Body() requestCountDto: RequestCountDto,
  ): Promise<any> {
    return this.userService.updateRequestCounter(requestCountDto);
  }

  @Get("usertotalrequest/:username")
  async userTotalRequest(
    @Req() req: Request,
    @Param("username") username: string,
  ): Promise<any> {
    this.endpointService.updateEndpointCounter({
      method: HttpMethod[req.method],
      name: this.stringService.endpoint.USER_TOTAL_REQUEST_PATH,
    });

    this.userService.updateRequestCounter({
      username: req["user"].username,
    });

    return this.userService.userTotalRequest(username);
  }
}
