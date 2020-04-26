import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getHackerNewsCategoryKeys, getDevToCategoryKeys, getAllSourceKeys } from './helpers/SourceHelper';
import source from './sources/SourceHandler';
import SourceOptionsBuilder from './helpers/SourceOptionsBuilder';
import { SourceOptions } from './@types/SourceOptions';

const sourceHandler = source(true);
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

export const sourceUber: APIGatewayProxyHandler = async (event) => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(await sourceHandler.uber(getOptions(event))),
});

export const sourceFacebook: APIGatewayProxyHandler = async (event) => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(await sourceHandler.facebook(getOptions(event))),
});

export const sourceNetflix: APIGatewayProxyHandler = async (event) => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(await sourceHandler.netflix(getOptions(event))),
});

export const sourceHackernews: APIGatewayProxyHandler = async (event) => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(await sourceHandler.hackerNews(getOptions(event))),
});

export const sourceAndroidpolice: APIGatewayProxyHandler = async (event) => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(await sourceHandler.androidPolice(getOptions(event))),
});

export const sourceDevto: APIGatewayProxyHandler = async (event) => ({
  statusCode: 200,
  headers,
  body: jsonStringifyPretty(await sourceHandler.devTo(getOptions(event))),
});

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
