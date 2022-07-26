import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { IUserResponse } from './types/userResponse.interface';
import { LoginUserDto } from './dto/login.dto';
import {compare} from 'bcrypt'
import { UpdateUserDto } from './dto/updateUser.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existUserByEmail = await this.userRepository.findOneBy({email: createUserDto.email})
    const existUserByUsername = await this.userRepository.findOneBy({username: createUserDto.username})
    if (existUserByEmail || existUserByUsername) {
      throw new HttpException('Email or username already taken', HttpStatus.UNPROCESSABLE_ENTITY)
    }
    const newUser = new UserEntity()
    return this.userRepository.save(Object.assign(newUser, createUserDto));
  }

  async login(dto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({where: {email: dto.email},
      select: ['id', 'email', 'password', 'username', 'bio', 'image', 'articles']})
    if (!user) throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    const isPasswordCompare = compare(dto.password, user.password)
    if (!isPasswordCompare) throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneBy({id: id})
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({id: id})
    Object.assign(user, dto)
    return await this.userRepository.save(user);
  }


  generateToken(user: UserEntity): string {
    const payload = {
      id: user.id,
      email: user.email
    }
    return sign(payload, process.env.JWT_SECRET_KEY)
  }

  buildUserResponse(user: UserEntity): IUserResponse {
    return {
      user: {
        ...user,
        token: this.generateToken(user)
      }
    }
  }

}