const categories = new Map([
  ['week', 'top/week'],
  ['month', 'top/month'],
  ['year', 'top/year'],
  ['infinity', 'top/infinity'],
  ['latest', 'latest'],
]);

export function getCategory(key: string | undefined): string {
  if (key && categories.has(key)) {
    return categories.get(key) as string;
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
export function getCategoryKeys(): Array<string> {
  return Array.from(categories.keys());
}