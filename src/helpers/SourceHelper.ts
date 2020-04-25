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
  return ['dev-to', 'uber', 'netflix', 'androidpolice', 'hackernews', 'facebook'];
}

/**
 * returns the urls you have to fetch from for paginated website depending of the
 * number of articles you need
 * @param url the baseUrl
 * @param nbOfArticles number of articles you want to fetch
 * @param articlePerPage number of articles per page
 */
export function getUrlsFromPaginatedSource(url: string, nbOfArticles: number, articlePerPage: number): string[] {
  const pages = new Array<string>(url);
  if (nbOfArticles >= articlePerPage) {
    let pageNumber = 2;
    let remainder = Math.floor(nbOfArticles / articlePerPage);
    while (remainder !== 0) {
      remainder -= 1;
      pages.push(`${url}/page/${pageNumber}/`);
      pageNumber += 1;
    }
  }
  return pages;
}
