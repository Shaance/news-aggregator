/* eslint-disable max-len */
import got from 'got';
import { getDevToCategory, getHackerNewsCategory } from '../helpers/SourceHelper';
import { Article } from '../@types/Article';
import parseDevto from './parsers/Dev-to-parser';
import parseNetflix from './parsers/Netflix-blog-parser';
import parseUber from './parsers/Uber-blog-parser';
import { parse as parseAndroidPolice, getPagesFromArticleNumbers } from './parsers/Android-police-parser';
import { getArticleFromStory, getStoryUrls } from './apis/HackerNewsApi';
import getFullHtml from './DynamicHtmlLoader';
import { SourceOptions } from '../@types/SourceOptions';


const allArticles = new Map<String, Article[]>(); // TODO database + cache instead of having everything in memory
let serverlessMode: boolean;

export async function handleDevToRequest(options: SourceOptions) {
  let sourceKey = 'dev-to/';
  const baseUrl = 'https://dev.to';
  const category = getDevToCategory(options.category);
  sourceKey += category;
  const url = category ? `${baseUrl}/${category}` : baseUrl;
  return handleDynamicSourceRequest(sourceKey, url, parseDevto, options, 'time');
}

export async function handleNetflixRequest(options: SourceOptions) {
  return handleStaticSourceRequest('netflix', ['https://netflixtechblog.com/'], parseNetflix, options);
}

export async function handleUberRequest(options: SourceOptions) {
  return handleStaticSourceRequest('uber', ['https://eng.uber.com/'], parseUber, options);
}

export async function handleAndroidPoliceRequest(options: SourceOptions) {
  return handleStaticSourceRequest('androidpolice', getPagesFromArticleNumbers('https://www.androidpolice.com/', options.numberOfArticles), parseAndroidPolice, options);
}

export async function handleHackerNewsRequest(options: SourceOptions) {
  let resolvedCategory = getHackerNewsCategory(options.category);
  if (!resolvedCategory) {
    // default to best stories
    resolvedCategory = getHackerNewsCategory('best');
  }
  const sourceKey = `hackernews/${resolvedCategory}`;
  let storyUrls: string[] = [];
  if (serverlessMode || options.forceRefresh || !allArticles.has(sourceKey) || allArticles.get(sourceKey)?.length < options.numberOfArticles) {
    storyUrls = (await getStoryUrls(resolvedCategory)).slice(0, options.numberOfArticles);
  }

  return handleStaticSourceRequest(sourceKey, storyUrls, getArticleFromStory, options);
}

function logForceRefresh(source: string) {
  console.log(`Force refresh articles for ${source}.`);
}

async function getStaticResponsesFromUrls(urls: string[], transformFunction: (source: any) => Article[]): Promise<Article[]> {
  return Promise.all(
    urls.map((url) => got(url).then((response) => response.body)),
  ).then((responses) => responses.flatMap((response) => transformFunction(response)));
}

// transformFunction is either a parsing function or a function which call an API
async function handleStaticSourceRequest(sourceKey: string, urls: string[], transformFunction: (source: any) => Article[], options: SourceOptions): Promise<Article[]> {
  if (!serverlessMode) {
    if (options.forceRefresh || !allArticles.get(sourceKey) || (allArticles.has(sourceKey) && allArticles.get(sourceKey)!.length < options.numberOfArticles)) {
      logForceRefresh(sourceKey);
      const parsedArticles: Article[] = await getStaticResponsesFromUrls(urls, transformFunction);
      allArticles.set(sourceKey, parsedArticles);
      return parsedArticles.slice(0, options.numberOfArticles);
    }
    return allArticles.get(sourceKey)?.slice(0, options.numberOfArticles);
  }

  const parsedArticles: Article[] = await getStaticResponsesFromUrls(urls, transformFunction);
  return parsedArticles.slice(0, options.numberOfArticles);
}

async function getDynamicResponsesFromUrls(url: string, transformFunction: (source: any) => Article[], elementToTrack: string, limit: number, loadButton?: string): Promise<Article[]> {
  return getFullHtml(url, elementToTrack, limit, loadButton).then((response) => transformFunction(response));
}

async function handleDynamicSourceRequest(sourceKey: string, url: string, transformFunction: (source: any) => Article[],
  options: SourceOptions, elementToTrack: string, loadButton?: string): Promise<Article[]> {
  if (!serverlessMode) {
    if (options.forceRefresh || !allArticles.get(sourceKey) || (allArticles.has(sourceKey) && allArticles.get(sourceKey)!.length < options.numberOfArticles)) {
      logForceRefresh(sourceKey);
      const parsedArticles: Article[] = await getDynamicResponsesFromUrls(url, transformFunction, elementToTrack, options.numberOfArticles, loadButton);
      allArticles.set(sourceKey, parsedArticles);
      return parsedArticles.slice(0, options.numberOfArticles);
    }
    return allArticles.get(sourceKey)?.slice(0, options.numberOfArticles);
  }

  const parsedArticles: Article[] = await getDynamicResponsesFromUrls(url, transformFunction, elementToTrack, options.numberOfArticles, loadButton);
  return parsedArticles.slice(0, options.numberOfArticles);
}

export default (serverless: boolean = false) => {
  serverlessMode = serverless;
  return {
    devTo: (options: SourceOptions) => handleDevToRequest(options),
    androidPolice: (options: SourceOptions) => handleAndroidPoliceRequest(options),
    hackerNews: (options: SourceOptions) => handleHackerNewsRequest(options),
    uber: (options: SourceOptions) => handleUberRequest(options),
    netflix: (options: SourceOptions) => handleNetflixRequest(options),
  };
};
