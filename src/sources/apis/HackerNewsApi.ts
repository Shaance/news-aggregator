/* eslint-disable no-console */
import got from 'got';
import { Article } from '../../@types/Article';
import { HackerNewsItem } from '../../@types/HackerNewsItem';

const url = 'https://hacker-news.firebaseio.com/v0';

export async function getStoryUrls(category: string): Promise<string[]> {
  const resolvedUrl = `${url}/${category}.json`;
  return got(resolvedUrl)
    .then((ids) => JSON.parse(ids.body).map((id: number) => `${url}/item/${id}.json`))
    .catch((err) => console.error(`Error while fetching data from ${resolvedUrl}\n${err}`));
}

// we return a Article array to comply with parsing interfaces
export function getArticleFromStory(json: any): Article[] {
  const item: HackerNewsItem = JSON.parse(json);
  if (item) {
    return [{
      title: item.title,
      url: item.url,
      author: item.by,
      date: new Date(item.time * 1000),
      source: 'hackerNews',
    }];
  }
  return [];
}
