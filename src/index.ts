import { getDevToCategoryKeys, getHackerNewsCategoryKeys } from './helpers/WebsiteCategories';
import express from 'express';
import { serve, setup } from 'swagger-ui-express';
import { swaggerDocs } from './config/SwaggerConfig';
import cron from 'node-cron';
import cors from 'cors';
import config from "./config/EnvConfig";
import { handleDevToRequest, handleNetflixRequest, handleUberRequest, handleAndroidPoliceRequest, handleHackerNewsRequest } from './sourceHandler';
import source from "./sourceHandler";

// TODO use logger instead of console.log

const app = express();
const sourceApi = '/api/v1/source'
const port = config.port;
const refreshFrequency = config.refreshFrequency; // in minutes
const sourceHandler = source(false);

app.use(cors());
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
  sourceHandler.devTo(req.query.forceRefresh === 'true', req.query.category as string)
    .then(articles => res.json(articles))
    .catch(error => next(error));
});

/**
 * @swagger
 * 
 * /api/v1/source/netflix:
 *  get:
 *    parameters:
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
  sourceHandler.netflix(req.query.forceRefresh === 'true')
  .then(articles => res.json(articles))
  .catch(error => next(error));
});

/**
 * @swagger
 * 
 * /api/v1/source/uber:
 *  get:
 *    parameters:
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
  sourceHandler.uber(req.query.forceRefresh === 'true')
  .then(articles =>res.json(articles))
  .catch(error => next(error));
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
  const articleNumber = req.query.articleNumber ? parseInt(req.query.articleNumber as string) : 25
  sourceHandler.androidPolice(articleNumber, req.query.forceRefresh === 'true')
  .then(articles => res.json(articles))
  .catch(error => next(error));
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
 *    description: Fetch articles from dev-to website
 *    responses:
 *      '200':
 *        description: Successful response 
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get(`${sourceApi}/hackernews`, async (req, res, next) => {
  const articleNumber = req.query.articleNumber ? parseInt(req.query.articleNumber as string) : 40;
  sourceHandler.hackerNews(articleNumber, req.query.forceRefresh === 'true', req.query.category as string)
  .then(articles => res.json(articles))
  .catch(error => next(error));
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
  console.log(`App listening at http://localhost:${port}`);
  updateAllSources();
});


cron.schedule(`${refreshFrequency} * * * *`, async () => {
  console.log('Refreshing all articles');
  updateAllSources();
});

async function updateAllSources() {
  handleDevToRequest(true).catch(err => console.error(err));
  getDevToCategoryKeys().forEach(category => handleDevToRequest(true, category).catch(err => console.error(err)));
  handleNetflixRequest(true).catch(err => console.error(err));
  handleUberRequest(true).catch(err => console.error(err));
  handleAndroidPoliceRequest(50, true).catch(err => console.error(err));
  getHackerNewsCategoryKeys().forEach(category => handleHackerNewsRequest(50, true, category).catch(err => console.error(err)));
}

function getAllSourceKeys() {
  return ['dev-to', 'netflix', 'uber', 'androidpolice', 'hackernews'];
}
