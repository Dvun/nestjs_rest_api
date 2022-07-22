import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { IUserResponse } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login.dto';
import { User } from '../decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<IUserResponse> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(@Body('user') dto: LoginUserDto): Promise<IUserResponse> {
    const user = await this.userService.login(dto)
    return this.userService.buildUserResponse(user)
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(
    @User() user: UserEntity): Promise<IUserResponse> {
    delete user.password
    return this.userService.buildUserResponse(user);
  }

}