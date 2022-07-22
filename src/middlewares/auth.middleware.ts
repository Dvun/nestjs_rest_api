import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { IExpressRequest } from '../types/expressRequest.interface';
import { verify } from 'jsonwebtoken';
import { UserService } from '../user/user.service';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userService: UserService
  ) {}

  async use(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null
      next()
      return
    }
    const token = req.headers.authorization.split(' ')[1]
    try {
      const decode = verify(token, process.env.JWT_SECRET_KEY)
      req.user = await this.userService.findById(decode.id)
      next()
    } catch (e) {
      req.user = null
      next()
    }
  }

}