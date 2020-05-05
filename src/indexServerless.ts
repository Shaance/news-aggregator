import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import {
  getHackerNewsCategoryKeys, getDevToCategoryKeys, getAllSourceKeys, sourceOptionsToString,
} from './helpers/SourceHelper';
import source from './sources/SourceArchiveHandler';
import SourceOptionsBuilder from './helpers/SourceOptionsBuilder';
import { SourceOptions } from './@types/SourceOptions';
import factory from './config/ConfigLog4j';

const logger = factory.getLogger('indexServerless');
const sourceArchiveHandler = source(true);
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

export const sourceUber: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called Uber endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.uber(options)),
  };
};

export const sourceFacebook: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called Facebook endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.facebook(options)),
  };
};

export const sourceNetflix: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called Netflix endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.netflix(options)),
  };
};

export const sourceHackernews: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called HackerNews endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.hackerNews(options)),
  };
};

export const sourceAndroidpolice: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called AndroidPolice endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.androidPolice(options)),
  };
};

export const sourceDevto: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called Dev.to endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.devTo(options)),
  };
};

export const sourceHighScalability: APIGatewayProxyHandler = async (event) => {
  const options = getOptions(event);
  logger.info(`Called High Scalability endpoint with options: ${sourceOptionsToString(options)}`);
  return {
    statusCode: 200,
    headers,
    body: jsonStringifyPretty(await sourceArchiveHandler.highScalability(options)),
  };
};

function setNumberOfArticles(event, builder: SourceOptionsBuilder) {
  if (event.queryStringParameters?.articleNumber) {
    builder.withArticleNumber(parseInt(event.queryStringParameters!.articleNumber, 10));
  }
}

function setCategory(event, builder: SourceOptionsBuilder) {
  if (event.queryStringParameters?.category) {
    builder.withCategory(event.queryStringParameters!.category);
  }
}

function getOptions(event): SourceOptions {
  const builder = new SourceOptionsBuilder();
  setCategory(event, builder);
  setNumberOfArticles(event, builder);
  return builder.build();
}

function jsonStringifyPretty(body: any) {
  return JSON.stringify(body, null, 2);
}
