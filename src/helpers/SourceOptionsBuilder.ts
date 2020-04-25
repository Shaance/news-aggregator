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

  setNumberOfArticles(articles: number) {
    this.numberOfArticles = articles;
    return this;
  }

  activateForceRefresh() {
    this.forceRefresh = true;
    return this;
  }

  setCategory(category: string) {
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
