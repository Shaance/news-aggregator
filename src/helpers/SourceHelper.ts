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
  return ['dev-to', 'uber', 'netflix', 'androidpolice', 'hackernews'];
}
