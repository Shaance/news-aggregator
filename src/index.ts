import { parse as parseDevto } from './parsers/Dev-to-parser';
import { parse as parseNetflix } from './parsers/Netflix-blog-parser';
import { parse as parseUber } from './parsers/Uber-blog-parser';
import { getCategory, getCategoryKeys } from './helpers/Dev-to-categories';
import express from 'express';
import request from 'request-promise';
import { serve, setup } from 'swagger-ui-express';
import { swaggerDocs } from './config/SwaggerConfig';

const app = express();
const port = 3000;

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
 *    description: Fetch articles from dev-to website, should return an array of Article 
 *    responses:
 *      '200':
 *        description: Successful response 
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get('/api/v1/source/dev-to', async (req, res, next) => {
  try {
    const baseUrl = 'https://dev.to';
    const category = getCategory(req.query.category);
    const url = category ? baseUrl + '/' + category : baseUrl;
    const html = await request(url);
    res.json(parseDevto(html, baseUrl));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * 
 * /api/v1/source/netflix:
 *  get:
 *    description: Fetch articles from Netflix technology blog, should return an array of Article
 *    responses:
 *      '200':
 *        description: Successful response 
 *        schema:
 *          $ref: '#/definitions/ArticleArray'
 *      '500':
 *        description: Error while connecting to the website
 */
app.get('/api/v1/source/netflix', async (_, res, next) => {
  try {
    const url = 'https://netflixtechblog.com/';
    const html = await request(url);
    res.json(parseNetflix(html));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * 
 * /api/v1/source/uber:
 *  get:
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
app.get('/api/v1/source/uber', async (_, res, next) => {
  try {
    const url = 'https://eng.uber.com/';
    const html = await request(url);
    res.send(parseUber(html));
  } catch (error) {
    next(error);
  }
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
  res.json(['dev-to', 'netflix', 'uber']);
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
