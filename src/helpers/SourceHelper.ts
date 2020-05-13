/* eslint-disable max-len */
import { SourceOptions } from '../@types/SourceOptions';
import { Source } from '../@types/Source';

const devToCategories = new Map([
  ['week', 'top/week'],
  ['month', 'top/month'],
  ['year', 'top/year'],
  ['infinity', 'top/infinity'],
  ['latest', 'latest'],
]);

export function getDevToCategory(key: string | undefined): string {
  if (key && devToCategories.has(key)) {
    return devToCategories.get(key) as string;
  }
  return '';
}

/**
 * @swagger
 *  definitions:
 *    StringArray:
 *      type: array
 *      items:
 *        type: string
 */
export function getDevToCategoryKeys(): string[] {
  return Array.from(devToCategories.keys());
}

const hackerNewsCategories = new Map([
  ['new', 'newstories'],
  ['best', 'beststories'],
]);

export function getHackerNewsCategory(key: string | undefined): string {
  if (key && hackerNewsCategories.has(key)) {
    return hackerNewsCategories.get(key) as string;
  }
  return '';
}

export function getHackerNewsCategoryKeys(): string[] {
  return Array.from(hackerNewsCategories.keys());
}

export function getAllSourceKeys() {
  return [
    'dev-to',
    'uber',
    'netflix',
    'androidpolice',
    'hackernews',
    'facebook',
    'highscalability',
  ];
}

export function getAllParsedSources() : Source[] {
  return [
    {
      key: 'dev-to', title: 'Dev.to', feedUrl: '', url: 'https://dev.to',
    },
    {
      key: 'uber', title: 'Uber engineering blog', feedUrl: 'https://eng.uber.com/feed/', url: 'https://eng.uber.com/',
    },
    {
      key: 'netflix', title: 'Netflix technology blog', feedUrl: 'https://medium.com/feed/netflix-techblog', url: 'https://medium.com/netflix-techblog',
    },
    {
      key: 'androidpolice', title: 'AndroidPolice', feedUrl: 'https://www.androidpolice.com/feed', url: 'https://www.androidpolice.com/',
    },
    {
      key: 'hackernews', title: 'HackerNews', feedUrl: '', url: 'https://news.ycombinator.com/',
    },
    {
      key: 'facebook', title: 'Facebook engineering blog', feedUrl: 'https://engineering.fb.com/feed/', url: 'https://engineering.fb.com/',
    },
    {
      key: 'highscalability', title: 'High scalability website', feedUrl: 'http://feeds.feedburner.com/HighScalability', url: 'http://highscalability.com/',
    },
  ];
}

/**
 * returns the urls you have to fetch from for paginated website depending of the
 * number of articles you need
 * @param url the baseUrl
 * @param nbOfArticles number of articles you want to fetch
 * @param articlePerPage number of articles per page
 * @param pattern the pagination pattern
 */
export function getUrlsFromPaginatedSource(url: string, nbOfArticles: number, articlePerPage: number, pattern: string): string[] {
  const pages = new Array<string>(url);
  if (nbOfArticles >= articlePerPage) {
    let pageNumber = 2;
    let remainder = Math.floor(nbOfArticles / articlePerPage);
    while (remainder !== 0) {
      remainder -= 1;
      pages.push(`${url}${pattern}${pageNumber}`);
      pageNumber += 1;
    }
  }
  return pages;
}

export function sourceOptionsToString(options: SourceOptions) {
  const { forceRefresh, category, numberOfArticles } = options;
  return `forceRefresh: ${forceRefresh}, category:${category}, numberOfArticles: ${numberOfArticles}`;
}
