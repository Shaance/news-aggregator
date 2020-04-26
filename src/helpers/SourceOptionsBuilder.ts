import { SourceOptions } from '../@types/SourceOptions';
import config from '../config/EnvConfig';

export default class SourceOptionsBuilder {
  private forceRefresh: boolean = false;

  private numberOfArticles: number = config.defaultNumberOfArticles;

  private category: string;

  constructor(source?: SourceOptions) {
    if (source) {
      if (source.category) {
        this.category = source.category;
      }
      this.forceRefresh = source.forceRefresh;
      this.numberOfArticles = source.numberOfArticles;
    }
  }

  withArticleNumber(articles: number) {
    this.numberOfArticles = articles;
    return this;
  }

  withForceFreshFlag(flag: boolean = true) {
    this.forceRefresh = flag;
    return this;
  }

  withCategory(category: string) {
    this.category = category;
    return this;
  }

  build(): SourceOptions {
    return {
      forceRefresh: this.forceRefresh,
      numberOfArticles: this.numberOfArticles,
      category: this.category,
    };
  }
}
