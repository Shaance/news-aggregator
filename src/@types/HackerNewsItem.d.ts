export interface HackerNewsItem {
  id: number;
  url: string;
  title: string;
  kids?: number[]
  by: string;
  time: number;
  descendants: number;
  score: number;
  type: string;
}