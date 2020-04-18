import { Article } from "../../@types/Article";
// import request from 'request-promise';
import axios from "axios";
import { HackerNewsItem } from "../../@types/HackerNewsItem";

const url = 'https://hacker-news.firebaseio.com/v0'

export async function getStoryUrls(category: string): Promise<string[]> {
  const resolvedUrl = `${url}/${category}.json`;
  return axios(resolvedUrl)
    .then(ids => ids.data.map((id: number) => `${url}/item/${id}.json`))
    .catch(err => console.error(`Error while fetching data from ${resolvedUrl}\n${err}`));
}

// we return a Article array to comply with parsing interfaces
export function getArticleFromStory(item: HackerNewsItem): Article[] {
  if (item) {
    return [{
      title: item.title,
      url: item.url,
      author: item.by,
      date: new Date(item.time * 1000),
      source: 'HackerNews'
    }];
  }
  return [];
}