import { getDevToCategory, getHackerNewsCategory } from "../helpers/WebsiteCategories";
import { Article } from "../@types/Article";
import got from "got";
import parseDevto from './parsers/Dev-to-parser';
import parseNetflix from './parsers/Netflix-blog-parser';
import parseUber from './parsers/Uber-blog-parser';
import { parse as parseAndroidPolice, getPagesFromArticleNumbers } from './parsers/Android-police-parser';
import { getArticleFromStory, getStoryUrls } from "./apis/HackerNewsApi";

// TODO test this class

const allArticles = new Map<String, Article[]>(); // TODO database + cache instead of having everything in memory
let _serverless: boolean;

export async function handleDevToRequest(forceRefresh: boolean, queryCategory?: string) {
  let sourceKey = 'dev-to/';
  const baseUrl = 'https://dev.to';
  const category = getDevToCategory(queryCategory);
  sourceKey += category;
  const url = category ? baseUrl + '/' + category : baseUrl;
  return handleSourceRequest(sourceKey, [url], parseDevto, forceRefresh);
}

export async function handleNetflixRequest(forceRefresh: boolean) {
  return handleSourceRequest('netflix', ['https://netflixtechblog.com/'], parseNetflix, forceRefresh);
}

export async function handleUberRequest(forceRefresh: boolean) {
  return handleSourceRequest('uber', ['https://eng.uber.com/'], parseUber, forceRefresh);
}

export async function handleAndroidPoliceRequest(numberOfArticles: number, forceRefresh: boolean) {
  const sourceKey = 'androidpolice';
  if (!_serverless && allArticles.has(sourceKey) && allArticles.get(sourceKey)!.length < numberOfArticles) {
    forceRefresh = true;
  }
  return handleSourceRequest(sourceKey, getPagesFromArticleNumbers('https://www.androidpolice.com/', numberOfArticles), parseAndroidPolice, forceRefresh,numberOfArticles);
}

export async function handleHackerNewsRequest(numberOfArticles: number, forceRefresh: boolean, queryCategory? : string) {
  let resolvedCategory = getHackerNewsCategory(queryCategory);
  if (!resolvedCategory) {
    // default to best stories
    resolvedCategory = getHackerNewsCategory('best');
  }
  const sourceKey = 'hackernews/' + resolvedCategory;
  let storyUrls: string[] = []
  if (!_serverless && !allArticles.has(sourceKey) || (allArticles.has(sourceKey) && allArticles.get(sourceKey)!.length < numberOfArticles)) {
    forceRefresh = true;
    storyUrls = (await getStoryUrls(resolvedCategory)).slice(0, numberOfArticles);
  } else if (_serverless || forceRefresh) {
    storyUrls = (await getStoryUrls(resolvedCategory)).slice(0, numberOfArticles);
  }

  return handleSourceRequest(sourceKey, storyUrls, getArticleFromStory,forceRefresh, numberOfArticles);
}

// transformFunction is either a parsing function or a function which call an API
async function handleSourceRequest(sourceKey: string, urls: string[], transformFunction: (source: any) => Article[], forceRefresh: boolean, numberOfArticles?: number): Promise<Article[]> {
  if (!_serverless) {
    if (forceRefresh || !allArticles.get(sourceKey)) {
      logForceRefresh(sourceKey);
      const parsedArticles: Article[] = await getResponsesFromUrls(urls, transformFunction);
      allArticles.set(sourceKey, parsedArticles);
      return numberOfArticles ? parsedArticles.slice(0, numberOfArticles) : parsedArticles;
    }
    return numberOfArticles ? allArticles.get(sourceKey)?.slice(0, numberOfArticles) : allArticles.get(sourceKey);
  }

  const parsedArticles: Article[] = await getResponsesFromUrls(urls, transformFunction);
  return numberOfArticles ? parsedArticles.slice(0, numberOfArticles) : parsedArticles;
}

async function getResponsesFromUrls(urls: string[], transformFunction: (source: any) => Article[]): Promise<Article[]> {
  return await Promise.all(
    urls.map(url => got(url).then(response => response.body))
  ).then(responses => responses.flatMap(response => transformFunction(response)));
}

function logForceRefresh(source: string) {
  console.log(`Force refresh articles for ${source}.`);
}

export default (serverless: boolean = false) => {
  _serverless = serverless;
  return {
    devTo: (category?: string, forceRefresh: boolean = false) => handleDevToRequest(forceRefresh, category),
    androidPolice: (numberOfArticles: number, forceRefresh: boolean = false) => handleAndroidPoliceRequest(numberOfArticles, forceRefresh),
    hackerNews: (numberOfArticles: number, category?: string, forceRefresh: boolean = false) => handleHackerNewsRequest(numberOfArticles, forceRefresh, category),
    uber: (forceRefresh: boolean = false) => handleUberRequest(forceRefresh),
    netflix: (forceRefresh: boolean = false) => handleNetflixRequest(forceRefresh)
  }
}