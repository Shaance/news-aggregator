import { parse as parseDevto } from './parsers/Dev-to-parser';
import { parse as parseNetflix } from './parsers/Netflix-blog-parser';
import { parse as parseUber } from './parsers/Uber-blog-parser';
import { parse as parseAndroidPolice, getPagesFromArticleNumbers } from './parsers/Android-police-parser';
import { getCategory, getCategoryKeys } from './helpers/Dev-to-categories';
import express from 'express';
import request from 'request-promise';
import { serve, setup } from 'swagger-ui-express';
import { swaggerDocs } from './config/SwaggerConfig';
import cron from 'node-cron';
import { Article } from './@types/Article';
import cors from 'cors';

const app = express();
const sourceApi = '/api/v1/source'
// TODO make port and refreshFrequency configurable
const port = 3001;
const refreshFrequency = "*/30"; // in minutes

// TODO database + cache instead of having everything in memory
const allArticles = new Map<String, Article[]>();

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
  handleDevToRequest(req.query.forceRefresh === 'true', req.query.category as string)
  .then(articles => {
    res.json(articles);
  }).catch(error => next(error));
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
  handleNetflixRequest(req.query.forceRefresh === 'true').then(articles => {
    res.json(articles);
  }).catch(error => next(error));
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
  handleUberRequest(req.query.forceRefresh === 'true').then(articles => {
    res.json(articles);
  }).catch(error => next(error));
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
  handleAndroidPoliceRequest(req.query.forceRefresh === 'true', req.query.articleNumber ? req.query.articleNumber : 50).then(articles => {
    res.json(articles);
  }).catch(error => next(error));
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
  res.json(getCategoryKeys());
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
  getCategoryKeys().forEach(category => handleDevToRequest(true, category));
  handleNetflixRequest(true).catch(err => console.error(err));
  handleUberRequest(true).catch(err => console.error(err));
  handleAndroidPoliceRequest(true, 50).catch(err => console.error(err));
}

async function handleDevToRequest(forceRefresh: boolean, queryCategory?: string) {
  let sourceKey = 'dev-to';
  if (forceRefresh) {
    const baseUrl = 'https://dev.to';
    const category = getCategory(queryCategory);
    console.log(`Force refresh articles for ${sourceKey} with category ${category}.`);
    sourceKey += category;
    const url = category ? baseUrl + '/' + category : baseUrl;
    const html = await request(url);
    const parsedArticles = parseDevto(html, baseUrl);
    allArticles.set(sourceKey, parsedArticles);
    return parsedArticles;
  }
  return allArticles.get(sourceKey);
}

async function handleNetflixRequest(forceRefresh: boolean) {
  return handleSourceRequest('netflix', ['https://netflixtechblog.com/'], parseNetflix, forceRefresh);
}

async function handleUberRequest(forceRefresh: boolean) {
  return handleSourceRequest('uber', ['https://eng.uber.com/'], parseUber, forceRefresh);
}

async function handleAndroidPoliceRequest(forceRefresh: boolean, numberOfArticles: number) {
  const sourceKey = 'androidpolice';
  // @ts-ignore
  if (allArticles.has(sourceKey) && allArticles.get(sourceKey).length < numberOfArticles) {
    forceRefresh = true;  
  }
  return handleSourceRequest(sourceKey, getPagesFromArticleNumbers('https://www.androidpolice.com/', numberOfArticles), parseAndroidPolice, forceRefresh, numberOfArticles);
}

async function handleSourceRequest(sourceKey: string, urls: string[], parseFunction: (html: string) => Article[], forceRefresh: boolean, numberOfArticles?: number) {
  if (forceRefresh) {
    console.log(`Force refresh articles for ${sourceKey}.`);
    const parsedArticles: Article[] = [];
    const htmls = await Promise.all(urls.map(url => request(url)));
    htmls.forEach(html => {
      parsedArticles.push(...parseFunction(html));
    });
    allArticles.set(sourceKey, parsedArticles);
    return numberOfArticles ? parsedArticles.slice(0, numberOfArticles) : parsedArticles;
  }
  return numberOfArticles ? allArticles.get(sourceKey)?.slice(0, numberOfArticles) : allArticles.get(sourceKey);
}

function getAllSourceKeys() {
  return ['dev-to', 'netflix', 'uber', 'androidpolice'];
}
