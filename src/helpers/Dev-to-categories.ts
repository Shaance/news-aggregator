const categories = new Map([
  ['week', 'top/week'],
  ['month', 'top/month'],
  ['year', 'top/year'],
  ['infinity', 'top/infinity'],
  ['latest', 'latest'],
]);

export function getCategory(key: string): string {
  if (categories.has(key)) {
    return categories.get(key) as string;
  }
  return '';
}

export function getCategoryKeys(): Array<string> {
  return Array.from(categories.keys());
}