import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { AuthGuard } from '../guards/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';


@Module({
  controllers: [ArticleController],
  providers: [ArticleService, AuthGuard, UserService],
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity])]
})

export class ArticleModule {}