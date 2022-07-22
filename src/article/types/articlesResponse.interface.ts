import { ArticleEntity } from '../article.entity';

export interface IArticlesResponse {
  articles: ArticleEntity[],
  articlesCount: number
}