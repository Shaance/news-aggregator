import { APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda';
import 'source-map-support/register';
import {
  getHackerNewsCategoryKeys, getDevToCategoryKeys, getAllSourceKeys,
  sourceOptionsToString, getAllParsedSources,
} from './helpers/SourceHelper';
import source from './sources/ParsedSourceHandler';
import SourceOptionsBuilder from './helpers/SourceOptionsBuilder';
import { SourceOptions } from './@types/SourceOptions';
import factory from './config/ConfigLog4j';
import { getSources, getArticles } from './sources/RssSourceHandler';

const logger = factory.getLogger('indexServerless');
const parsedSourceHandler = source(true);
const headers = {
  'Content-Type': 'application/json; charset=UTF-8',
};

export const infoSourceKeys: APIGatewayProxyHandler = async () => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(getAllSourceKeys()),
});

export const infoDevToCategoryKeys: APIGatewayProxyHandler = async () => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(getDevToCategoryKeys()),
});

export const infoHackerNewsCategoryKeys: APIGatewayProxyHandler = async () => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(getHackerNewsCategoryKeys()),
});

export const fetchRssSources: APIGatewayProxyHandler = async () => {
  logger.info('Called fetch RSS sources endpoint');
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(getSources()),
  };
};

export const fetchParsedSources: APIGatewayProxyHandler = async () => {
  logger.info('Called fetch Parsed sources endpoint');
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(getAllParsedSources()),
  };
};

export const fetchRssArticles: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called fetch Rss Articles endpoint with options: ${sourceOptionsToString(options)}, key: ${event.pathParameters.key}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await getArticles(event.pathParameters.key, options)),
  };
};

export const fetchParsedArticles: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called fetch Parsed Articles endpoint with options: ${sourceOptionsToString(options)}, key: ${event.pathParameters.key}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await parsedSourceHandler.parse(event.pathParameters.key, options)),
  };
};

function setNumberOfArticles(event: APIGatewayEvent, builder: SourceOptionsBuilder) {
  if (event.queryStringParameters?.articleNumber) {
    builder.withArticleNumber(parseInt(event.queryStringParameters!.articleNumber, 10));
  }
}

function setCategory(event: APIGatewayEvent, builder: SourceOptionsBuilder) {
  if (event.queryStringParameters?.category) {
    builder.withCategory(event.queryStringParameters!.category);
  }
}

function getOptions(event: APIGatewayEvent): SourceOptions {
  const builder = new SourceOptionsBuilder();
  setCategory(event, builder);
  setNumberOfArticles(event, builder);
  return builder.build();
}

function jsonStringifyPretty(body: any) {
  return JSON.stringify(body, null, 2);
}
