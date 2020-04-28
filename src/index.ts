/* eslint-disable max-len */
import express from 'express';
import compression from 'compression';
import { serve, setup } from 'swagger-ui-express';
import cron from 'node-cron';
import cors from 'cors';
import swaggerDocs from './config/SwaggerConfig';
import {
  getDevToCategoryKeys, getHackerNewsCategoryKeys, getAllSourceKeys, sourceOptionsToString,
} from './helpers/SourceHelper';
import config from './config/EnvConfig';
import source from './sources/SourceHandler';
import factory from './config/ConfigLog4j';
import SourceOptionsBuilder from './helpers/SourceOptionsBuilder';
import { SourceOptions } from './@types/SourceOptions';

// TODO use logger instead of console.log

const app = express();
const sourceApi = '/api/v1/source';
const { port } = config;
const { refreshFrequency } = config; // in minutes
const sourceHandler = source();
const logger = factory.getLogger('index');

app.use(cors());
app.use(compression());
app.use('/api-docs', serve, setup(swaggerDocs(port)));

/**
 * @swagger
 *
 * /api/v1/source/dev-to:
 *  get:
 *    parameters:
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *        required: false
 *        description: Category to fetch from, existing categories can be fetch by using '/api/v1/info/source/dev-to/categories'.
 *                     Unknown / no category results in fetching from dev.to homepage (no category)
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    description: Fetch articles from dev-to website
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/dev-to`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called Dev.to endpoint with options: ${sourceOptionsToString(options)}`);
  sourceHandler.devTo(options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

/**
 * @swagger
 *
 * /api/v1/source/netflix:
 *  get:
 *    parameters:
 *      - in: query
 *        name: articleNumber
 *        schema:
 *          type: integer
 *        required: false
 *        description: Article number to fetch from Netflix
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    description: Fetch articles from Netflix technology blog, should return an array of Article
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/netflix`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called Netflix endpoint with options: ${sourceOptionsToString(options)}`);
  sourceHandler.netflix(options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

/**
 * @swagger
 *
 * /api/v1/source/uber:
 *  get:
 *    parameters:
 *      - in: query
 *        name: articleNumber
 *        schema:
 *          type: integer
 *        required: false
 *        description: Article number to fetch from Uber
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    description: Fetch articles from Uber engineering blog, should return an array of Article
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          type: array
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/uber`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called Uber endpoint with options: ${sourceOptionsToString(options)}`);
  sourceHandler.uber(options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

/**
 * @swagger
 *
 * /api/v1/source/facebook:
 *  get:
 *    parameters:
 *      - in: query
 *        name: articleNumber
 *        schema:
 *          type: integer
 *        required: false
 *        description: Article number to fetch from Facebook engineering blog
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    description: Fetch articles from Facebook engineering blog, should return an array of Article
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          type: array
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/facebook`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called Facebook endpoint with options: ${sourceOptionsToString(options)}`);
  sourceHandler.facebook(options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

/**
 * @swagger
 *
 * /api/v1/source/androidpolice:
 *  get:
 *    parameters:
 *      - in: query
 *        name: articleNumber
 *        schema:
 *          type: integer
 *        required: false
 *        description: Article number to fetch from AndroidPolice
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          type: array
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/androidpolice`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called AndroidPolice endpoint with options: ${sourceOptionsToString(options)}`);
  sourceHandler.androidPolice(options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

/**
 * @swagger
 *
 * /api/v1/source/hackernews:
 *  get:
 *    parameters:
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *        required: false
 *        description: Category to fetch from, existing categories can be fetch by using '/api/v1/info/source/hackernews/categories'.
 *                     Unknown / no category results in fetching from best stories category
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *      - in: query
 *        name: articleNumber
 *        schema:
 *          type: integer
 *        required: false
 *        description: Article number to fetch from HackerNews
 *    description: Fetch articles from Hackernews website
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/hackernews`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called HackerNews endpoint with options: ${sourceOptionsToString(options)}`);
  sourceHandler.hackerNews(options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

/**
 * @swagger
 *
 * /api/v1/info/source/dev-to/categories:
 *  get:
 *    description: Fetch the categories we can fetch from dev-to
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          type: array
 *          $ref: '#/definitions/StringArray'
 *      '500':
 *        description: Internal server error
 */
app.get('/api/v1/info/source/dev-to/categories', (_, res) => {
  res.json(getDevToCategoryKeys());
});

/**
 * @swagger
 *
 * /api/v1/info/source/hackernews/categories:
 *  get:
 *    description: Fetch the categories we can fetch from hackernews
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          type: array
 *          $ref: '#/definitions/StringArray'
 *      '500':
 *        description: Internal server error
 */
app.get('/api/v1/info/source/hackernews/categories', (_, res) => {
  res.json(getHackerNewsCategoryKeys());
});

/**
 * @swagger
 *
 * /api/v1/info/sources:
 *  get:
 *    description: Fetch the sources available from this API
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          type: array
 *          $ref: '#/definitions/StringArray'
 *      '500':
 *        description: Internal server error
 */
app.get('/api/v1/info/sources', (_, res) => {
  res.json(getAllSourceKeys());
});

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
  updateAllSources();
});

cron.schedule(`${refreshFrequency} * * * *`, async () => {
  logger.info('Refreshing all articles');
  updateAllSources();
});

function setNumberOfArticles(req, builder: SourceOptionsBuilder) {
  if (req.query.articleNumber) {
    builder.withArticleNumber(parseInt(req.query.articleNumber, 10));
  }
}

function setCategory(req, builder: SourceOptionsBuilder) {
  if (req.query.category) {
    builder.withCategory(req.query.category);
  }
}

function setForceRefresh(req, builder: SourceOptionsBuilder) {
  if (req.query.forceRefresh === 'true') {
    builder.withForceFreshFlag();
  }
}

function getOptions(req): SourceOptions {
  const builder = new SourceOptionsBuilder();
  setCategory(req, builder);
  setNumberOfArticles(req, builder);
  setForceRefresh(req, builder);
  return builder.build();
}

async function updateAllSources() {
  const baseOptionsBuilder = new SourceOptionsBuilder().withForceFreshFlag();
  sourceHandler.devTo(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  getDevToCategoryKeys().forEach((category) => {
    sourceHandler.devTo(
      new SourceOptionsBuilder(baseOptionsBuilder.build())
        .withCategory(category)
        .build(),
    ).catch((err) => logger.error(err));
  });
  sourceHandler.netflix(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  sourceHandler.uber(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  sourceHandler.androidPolice(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  getHackerNewsCategoryKeys().forEach((category) => {
    sourceHandler.hackerNews(
      new SourceOptionsBuilder(baseOptionsBuilder.build())
        .withCategory(category)
        .build(),
    ).catch((err) => logger.error(err));
  });
  sourceHandler.facebook(baseOptionsBuilder.build()).catch((err) => logger.error(err));
}
