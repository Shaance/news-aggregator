/* eslint-disable import/named */
/* eslint-disable max-len */
import express from 'express';
import compression from 'compression';
import { serve, setup } from 'swagger-ui-express';
import cron from 'node-cron';
import cors from 'cors';
import swaggerDocs from './config/SwaggerConfig';
import {
  getDevToCategoryKeys, getHackerNewsCategoryKeys, getAllSourceKeys, sourceOptionsToString, getAllParsedSources,
} from './helpers/SourceHelper';
import config from './config/EnvConfig';
import source from './sources/ParsedSourceHandler';
import factory from './config/ConfigLog4j';
import SourceOptionsBuilder from './helpers/SourceOptionsBuilder';
import { SourceOptions } from './@types/SourceOptions';
import { getSources, getArticles } from './sources/RssSourceHandler';

const app = express();
const SOURCE_API_V2 = '/api/v2/source';
const INFO_SOURCE_API_V1 = '/api/v1/info/source';
const { port } = config;
const { refreshFrequency } = config; // in minutes
const parsedSourceHandler = source();
const logger = factory.getLogger('index');

app.use(cors());
app.use(compression());
app.use('/api-docs', serve, setup(swaggerDocs(port)));

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
app.get(`${INFO_SOURCE_API_V1}/dev-to/categories`, (_, res) => {
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
app.get(`${INFO_SOURCE_API_V1}/hackernews/categories`, (_, res) => {
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


app.get(`${SOURCE_API_V2}/parsed`, (_, res) => {
  logger.info('Called source parsed endpoint');
  res.json(getAllParsedSources());
});

/**
 * @swagger
 *
 * /api/v2/source/parsed/{sourceKey}:
 *  get:
 *    parameters:
 *      - in: path
 *        name: sourceKey
 *        schema:
 *          type: string
 *        required: true
 *        description: Source you want to fetch from
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *        required: false
 *        description: Category to fetch from, existing categories can be fetch by using '/api/v1/info/source/{sourceKey}/categories'.
 *                     Unknown / no category results in fetching from dev.to homepage (no category) / best category for hackernews
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    description: Fetch articles from desired source
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${SOURCE_API_V2}/parsed/:sourceKey`, async (req, res, next) => {
  const options = getOptions(req);
  logger.info(`Called ${req.params.sourceKey} endpoint with options: ${sourceOptionsToString(options)}`);
  parsedSourceHandler.parse(req.params.sourceKey, options)
    .then((articles) => res.json(articles))
    .catch((error) => next(error));
});

app.get(`${SOURCE_API_V2}/rss`, (_, res) => {
  res.json(getSources());
});

/**
 * @swagger
 *
 * /api/v2/source/rss/{sourceKey}:
 *  get:
 *    parameters:
 *      - in: path
 *        name: sourceKey
 *        schema:
 *          type: string
 *        required: true
 *        description: Source you want to fetch from
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *        required: false
 *        description: Category to fetch from, existing categories can be fetch by using '/api/v1/info/source/{sourceKey}/categories'.
 *                     Unknown / no category results in fetching from dev.to homepage (no category) / best category for hackernews
 *      - in: query
 *        name: forceRefresh
 *        schema:
 *          type: string
 *        required: false
 *        description: Cache version is returned by default. To force the refresh set this query param to true
 *    description: Fetch articles from desired source (RSS or parsed if source is supported)
 *    responses:
 *      '200':
 *        description: Successful response
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${SOURCE_API_V2}/rss/:sourceKey`, (req, res, next) => {
  logger.info(`Called source endpoint with params: ${req.params.sourceKey?.toString()}`);
  getArticles(req.params.sourceKey, getOptions(req))
    .then((articles) => {
      if (articles?.length > 0) {
        res.json(articles);
      } else {
        const notFoundMessage = `Unknown source or no article for ${req.params.sourceKey?.toString()} source.`;
        logger.info(notFoundMessage);
        res.status(204).send(notFoundMessage);
      }
    })
    .catch((err) => next(err));
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
  parsedSourceHandler.devTo(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  getDevToCategoryKeys().forEach((category) => {
    parsedSourceHandler.devTo(
      new SourceOptionsBuilder(baseOptionsBuilder.build())
        .withCategory(category)
        .build(),
    ).catch((err) => logger.error(err));
  });
  parsedSourceHandler.netflix(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  parsedSourceHandler.uber(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  parsedSourceHandler.androidPolice(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  getHackerNewsCategoryKeys().forEach((category) => {
    parsedSourceHandler.hackerNews(
      new SourceOptionsBuilder(baseOptionsBuilder.build())
        .withCategory(category)
        .build(),
    ).catch((err) => logger.error(err));
  });
  parsedSourceHandler.facebook(baseOptionsBuilder.build()).catch((err) => logger.error(err));
  parsedSourceHandler.highScalability(baseOptionsBuilder.build()).catch((err) => logger.error(err));
}
