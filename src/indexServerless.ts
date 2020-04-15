import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getHackerNewsCategoryKeys, getDevToCategoryKeys } from './helpers/WebsiteCategories';
import source from "./sourceHandler";

const sourceHandler = source(true);

export const infoSourceKeys: APIGatewayProxyHandler = async (_, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(getAllSourceKeys()),
  };
};

export const infoDevToCategoryKeys: APIGatewayProxyHandler = async (_, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(getDevToCategoryKeys()),
  };
};

export const infoHackerNewsCategoryKeys: APIGatewayProxyHandler = async (_, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(getHackerNewsCategoryKeys()),
  };
};

export const sourceUber: APIGatewayProxyHandler = async (_, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(await sourceHandler.uber(false))
  };
};

export const sourceNetflix: APIGatewayProxyHandler = async (_, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(await sourceHandler.netflix(false))
  };
};

export const sourceHackernews: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(await sourceHandler.hackerNews(
      parseInt(event.queryStringParameters?.articleNumber) || 40,
      false,
      event.queryStringParameters?.category
    ))
  };
};

export const sourceAndroidpolice: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(await sourceHandler.androidPolice(parseInt(event.queryStringParameters?.articleNumber) || 35, false))
  };
};

export const sourceDevto: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: jsonStringifyPretty(await sourceHandler.devTo(false,
      event.queryStringParameters?.category
    ))
  };
};

function getAllSourceKeys() {
  return ['dev-to', 'netflix', 'uber', 'androidpolice', 'hackernews'];
}

function jsonStringifyPretty(body: any) {
  return JSON.stringify(body, null, 2);
}