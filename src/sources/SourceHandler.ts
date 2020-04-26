/* eslint-disable max-len */
import got from 'got';
import { getDevToCategory, getHackerNewsCategory, getUrlsFromPaginatedSource } from '../helpers/SourceHelper';
import { Article } from '../@types/Article';
import parseDevto from './parsers/Dev-to-parser';
import parseNetflix from './parsers/Netflix-blog-parser';
import parseUber from './parsers/Uber-blog-parser';
import parseFacebook from './parsers/Facebook-blog-parser';
import parseAndroidPolice from './parsers/Android-police-parser';
import { getArticleFromStory, getStoryUrls } from './apis/HackerNewsApi';
import getFullHtml from './DynamicHtmlLoader';
import { SourceOptions } from '../@types/SourceOptions';
import factory from '../config/ConfigLog4j';

const logger = factory.getLogger('SourceHandler');
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
  return handleDynamicSourceRequest('netflix', 'https://netflixtechblog.com/', parseNetflix, options, 'time');
}

export async function handleUberRequest(options: SourceOptions) {
  return handleStaticSourceRequest('uber', getUrlsFromPaginatedSource('https://eng.uber.com/', options.numberOfArticles, 20), parseUber, options);
}

export async function handleFacebookRequest(options: SourceOptions) {
  return handleDynamicSourceRequest('facebook', 'https://engineering.fb.com/', parseFacebook, options, 'time', '.btn.loadmore-btn');
}

export async function handleAndroidPoliceRequest(options: SourceOptions) {
  return handleStaticSourceRequest('androidpolice', getUrlsFromPaginatedSource('https://www.androidpolice.com/', options.numberOfArticles, 10), parseAndroidPolice, options);
}

export async function handleHackerNewsRequest(options: SourceOptions) {
  const { category, forceRefresh, numberOfArticles } = options;
  let resolvedCategory = getHackerNewsCategory(category);
  if (!resolvedCategory) {
    // default to best stories
    resolvedCategory = getHackerNewsCategory('best');
  }
  const sourceKey = `hackernews/${resolvedCategory}`;
  let storyUrls: string[] = [];
  if (serverlessMode || forceRefresh || !allArticles.has(sourceKey) || allArticles.get(sourceKey)?.length < numberOfArticles) {
    storyUrls = (await getStoryUrls(resolvedCategory)).slice(0, numberOfArticles);
  }

  return handleStaticSourceRequest(sourceKey, storyUrls, getArticleFromStory, options);
}

function logForceRefresh(source: string) {
  logger.info(`Force refresh articles for ${source}.`);
}

async function getStaticResponsesFromUrls(urls: string[], transformFunction: (source: any) => Article[]): Promise<Article[]> {
  return Promise.all(
    urls.map((url) => got(url).then((response) => response.body)),
  ).then((responses) => responses.flatMap((response) => transformFunction(response)));
}

// transformFunction is either a parsing function or a function which call an API
async function handleStaticSourceRequest(sourceKey: string, urls: string[], transformFunction: (source: any) => Article[], options: SourceOptions): Promise<Article[]> {
  const { forceRefresh, numberOfArticles } = options;
  if (!serverlessMode) {
    if (forceRefresh || !allArticles.get(sourceKey) || (allArticles.has(sourceKey) && allArticles.get(sourceKey)!.length < numberOfArticles)) {
      logForceRefresh(sourceKey);
      const parsedArticles: Article[] = await getStaticResponsesFromUrls(urls, transformFunction);
      allArticles.set(sourceKey, parsedArticles);
      return parsedArticles.slice(0, numberOfArticles);
    }
    return allArticles.get(sourceKey)?.slice(0, numberOfArticles);
  }

  const parsedArticles: Article[] = await getStaticResponsesFromUrls(urls, transformFunction);
  return parsedArticles.slice(0, numberOfArticles);
}

async function getDynamicResponsesFromUrls(url: string, transformFunction: (source: any) => Article[], elementToTrack: string, limit: number, loadButton?: string): Promise<Article[]> {
  return getFullHtml(url, elementToTrack, limit, loadButton).then((response) => transformFunction(response));
}

async function handleDynamicSourceRequest(sourceKey: string, url: string, transformFunction: (source: any) => Article[],
  options: SourceOptions, elementToTrack: string, loadButton?: string): Promise<Article[]> {
  const { forceRefresh, numberOfArticles } = options;
  if (!serverlessMode) {
    if (forceRefresh || !allArticles.get(sourceKey) || (allArticles.has(sourceKey) && allArticles.get(sourceKey)!.length < numberOfArticles)) {
      logForceRefresh(sourceKey);
      const parsedArticles: Article[] = await getDynamicResponsesFromUrls(url, transformFunction, elementToTrack, numberOfArticles, loadButton);
      allArticles.set(sourceKey, parsedArticles);
      return parsedArticles.slice(0, numberOfArticles);
    }
    return allArticles.get(sourceKey)?.slice(0, numberOfArticles);
  }

  const parsedArticles: Article[] = await getDynamicResponsesFromUrls(url, transformFunction, elementToTrack, numberOfArticles, loadButton);
  return parsedArticles.slice(0, numberOfArticles);
}

export default (serverless: boolean = false) => {
  serverlessMode = serverless;
  return {
    devTo: (options: SourceOptions) => handleDevToRequest(options),
    androidPolice: (options: SourceOptions) => handleAndroidPoliceRequest(options),
    hackerNews: (options: SourceOptions) => handleHackerNewsRequest(options),
    uber: (options: SourceOptions) => handleUberRequest(options),
    facebook: (options: SourceOptions) => handleFacebookRequest(options),
    netflix: (options: SourceOptions) => handleNetflixRequest(options),
  };
};
