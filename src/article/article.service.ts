import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from './dto/create.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { IArticleResponse } from './types/articleResponse.interface';
import slugify from 'slugify';
import { IArticlesResponse } from './types/articlesResponse.interface';


@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
  ) {}

  async findAll(currentUserId: number, query: any): Promise<IArticlesResponse> {
    const queryBuilder = await this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
    queryBuilder.orderBy('articles.createdAt', 'DESC')
    const articlesCount = await queryBuilder.getCount()
    if (query.author) {
      const author = await this.userRepository.findOneBy({username: query.author})
      queryBuilder.andWhere('articles.authorId = :id', {id: author.id})
    }
    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {tag: `%${query.tag}%`})
    }
    if (query.favorited) {
      const author = await this.userRepository.findOne({where: {username: query.favorited}, relations: ['favorites']})
      const ids = author.favorites.map((el) => el.id)
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', {ids})
      } else {
        queryBuilder.andWhere('1=0')
      }
    }
    if (query.limit) queryBuilder.limit(query.limit)
    if (query.offset) queryBuilder.offset(query.offset)
    let favoriteIds: number[] = []
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({where: {id: currentUserId}, relations: ['favorites']})
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id)
    }
    const articles = await queryBuilder.getMany()
    const articlesWithFavorites = articles.map(article => {
      const isFavorite = favoriteIds.includes(article.id)
      return {...article, isFavorite}
    })
    return {articles: articlesWithFavorites, articlesCount}
  }

  async create(currentUser: UserEntity, dto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity()
    Object.assign(article, dto)
    if (!article.tagList) article.tagList = []
    article.author = currentUser;
    article.slug = this.slugGenerate(dto.title);
    return await this.articleRepository.save(article)
  }

  async getBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOneBy({slug})
  }

  async updateBySlug(currentUserId: number, slug: string, dto: CreateArticleDto): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneBy({slug})
    if (!article) throw new HttpException('Article not found!', HttpStatus.NOT_FOUND)
    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
    }
    return await this.articleRepository.save(Object.assign(article, dto))
  }

  async deleteBySlug(currentUserId: number, slug: string): Promise<DeleteResult> {
    const article = await this.articleRepository.findOneBy({slug})
    if (!article) throw new HttpException('Article not found!', HttpStatus.NOT_FOUND)
    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
    }
    return await this.articleRepository.delete(article.id)
  }

  async addArticleToFavorites(currentUserId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneBy({slug})
    const user = await this.userRepository.findOne({where: {id: currentUserId}, relations: ['favorites']})
    const isNotFavorites = user.favorites.findIndex(favoriteArticle => favoriteArticle.id === article.id) === -1;
    if (isNotFavorites) {
      user.favorites.push(article)
      article.favoritesCount++
      await this.userRepository.save(user)
      await this.articleRepository.save(article)
    }
    return article
  }

  async removeArticleFromFavorites(currentUserId, slug): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOneBy({slug})
    const user = await this.userRepository.findOne({where: {id: currentUserId}, relations: ['favorites']})
    const articleIndex = user.favorites.findIndex(favoriteArticle => favoriteArticle.id === article.id);
    if (articleIndex) {
      user.favorites.splice(articleIndex, 1)
      article.favoritesCount--
      await this.userRepository.save(user)
      await this.articleRepository.save(article)
    }
    return article;
  }


  buildArticleResponse(article: ArticleEntity): IArticleResponse {
    return {article};
  }

  slugGenerate(title: string): string {
    return slugify(title, {lower: true}) + '_' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
  }

}
