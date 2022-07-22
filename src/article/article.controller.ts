import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from './dto/create.dto';
import { IArticleResponse } from './types/articleResponse.interface';
import { IArticlesResponse } from './types/articlesResponse.interface';


@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService
  ) {}

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: any): Promise<IArticlesResponse> {
    return await this.articleService.findAll(currentUserId, query)
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('article') dto: CreateArticleDto): Promise<IArticleResponse> {
    const article = await this.articleService.create(currentUser, dto)
    return this.articleService.buildArticleResponse(article)
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string): Promise<IArticleResponse> {
    const article = await this.articleService.getBySlug(slug)
    return this.articleService.buildArticleResponse(article)
  }

  @Put(':slug')
  @UsePipes(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateBySlug(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Body('article') dto: CreateArticleDto): Promise<IArticleResponse> {
    const article = await this.articleService.updateBySlug(currentUserId, slug, dto)
    return this.articleService.buildArticleResponse(article)
  }

  @Delete(':slug')
  @UsePipes(AuthGuard)
  async deleteBySlug(
    @User('id') currentUserId: number,
    @Param('slug') slug: string) {
    return this.articleService.deleteBySlug(currentUserId, slug)
  }

}