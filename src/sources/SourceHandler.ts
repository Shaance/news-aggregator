/* eslint-disable no-shadow */
/* eslint-disable object-curly-newline */
import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';
import Parser, { Output } from 'rss-parser';
import { Source } from '../@types/Source';
import { Article } from '../@types/Article';
import sourceArchive from './SourceArchiveHandler';
import { getAllSourceKeys } from '../helpers/SourceHelper';
import { SourceOptions } from '../@types/SourceOptions';
import factory from '../config/ConfigLog4j';

const logger = factory.getLogger('SourceHandler');
const rssParser = new Parser();
const sourceArchiveHandler = sourceArchive();

export function getSources(): Source[] {
  const data = fs.readFileSync(path.join('res', 'rss', 'feeds.opml'), 'UTF-8');
  const $ = load(data);
  return $('outline')
    .filter((_idx, elem) => elem.attribs?.type === 'rss')
    .toArray()
    .map((elem) => {
      const { text, title, xmlurl, htmlurl } = elem.attribs;
      return {
        key: encodeURIComponent(text),
        title,
        feedUrl: xmlurl,
        url: htmlurl,
      };
    });
}

export async function getArticles(key: string, options: SourceOptions): Promise<Article[]> {
  let articles: Article[] = [];
  if (key) {
    const archiveSources = getAllSourceKeys();
    if (archiveSources.includes(key)) {
      logger.info('Archive endpoint detection will use sourceArchiveHandler');
      return keyToSourceArchiveFunction(key, options);
    }
    const sources = getSources();
    const resolvedSource = sources
      .filter((source) => source.key === encodeURIComponent(key));

    if (resolvedSource?.length > 0) {
      try {
        const parsedItem: Output = await rssParser.parseURL(resolvedSource[0].feedUrl);
        const sourceIconUrl = parsedItem.image?.link;
        articles = parsedItem.items.map((item) => ({
          title: item.title,
          url: item.link,
          author: item.creator,
          date: new Date(item.isoDate),
          source: resolvedSource[0].key,
          sourceIconUrl,
        }));
      } catch (err) {
        logger.error(`Error while fetching ${resolvedSource}: ${err}`, err);
      }
    }
  }
  return articles;
}

function keyToSourceArchiveFunction(sourceKey: String, options: SourceOptions) {
  switch (sourceKey) {
    case 'uber': {
      return sourceArchiveHandler.uber(options);
    }
    case 'netflix': {
      return sourceArchiveHandler.netflix(options);
    }
    case 'dev-to': {
      return sourceArchiveHandler.devTo(options);
    }
    case 'facebook': {
      return sourceArchiveHandler.facebook(options);
    }
    case 'highscalability': {
      return sourceArchiveHandler.highScalability(options);
    }
    case 'hackernews': {
      return sourceArchiveHandler.hackerNews(options);
    }
    default: {
      return sourceArchiveHandler.androidPolice(options);
    }
  }
}
