export function getCategory(key: string): string {
  switch (key) {
    case 'week':
      return 'top/week'
    case 'month':
      return 'top/month'
    case 'year':
      return 'top/year'
    case 'infinity':
      return 'top/infinity'
    case 'latest':
      return 'latest'
    default:
      return '';
  }
}