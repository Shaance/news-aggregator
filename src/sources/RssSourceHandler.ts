/* eslint-disable no-shadow */
/* eslint-disable object-curly-newline */
import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';
import Parser, { Output } from 'rss-parser';
import grabity from 'grabity';
import { Source } from '../@types/Source';
import { Article } from '../@types/Article';
import parsedSourceHandler from './ParsedSourceHandler';
import { getAllSourceKeys } from '../helpers/SourceHelper';
import { SourceOptions } from '../@types/SourceOptions';
import factory from '../config/ConfigLog4j';

const logger = factory.getLogger('RssSourceHandler');
const rssParser = new Parser();
const ParsedSourceHandler = parsedSourceHandler();

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

export async function getArticles(key: string, options: SourceOptions) {
  let articles: Article[] = [];
  if (key || options.feedUrl) {
    let finalUrl: string;
    let finalKey: string;
    if (!options.feedUrl) {
      const archiveSources = getAllSourceKeys();
      if (archiveSources.includes(key)) {
        logger.info('Archive endpoint detection will use ParsedSourceHandler');
        return ParsedSourceHandler.parse(key, options);
      }

      const resolvedSource = getSources()
        .filter((source) => source.key === encodeURIComponent(key));
      if (resolvedSource?.length > 0) {
        const { feedUrl, key } = resolvedSource.pop();
        finalUrl = feedUrl;
        finalKey = key;
      }
    } else {
      finalUrl = options.feedUrl;
      finalKey = key;
    }

    if (finalKey) {
      try {
        articles = await parseRssArticleFromUrl(finalUrl, finalKey);
      } catch (err) {
        logger.error(`Error while fetching ${finalKey}: ${err}`, err);
      }
    }
  }
  return articles;
}

async function parseRssArticleFromUrl(feedUrl: string, sourceKey: string): Promise<Article[]> {
  const parsedItem: Output = await rssParser.parseURL(feedUrl);
  const sourceIconUrl = parsedItem.image?.link;
  // TODO add properties from parser.Output to Article type

  return Promise.all(
    parsedItem.items.map((item) => {
      const response = grabity.grabIt(item.link);
      return response.then((link) => {
        let image;
        if (link.image) {
          image = link.image;
        }
        return {
          title: item.title,
          url: item.link,
          author: item.creator,
          date: new Date(item.isoDate),
          source: sourceKey,
          sourceIconUrl,
          contentSnippet: item.contentSnippet,
          categories: item.categories,
          imageUrl: image,
        };
      });
    }),
  );
}
