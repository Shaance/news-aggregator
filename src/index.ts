import { parse as parseDevto } from "./parsers/Dev-to-parser";
import { parse as parseNetflix } from "./parsers/Netflix-blog-parser";
import { parse as parseUber } from "./parsers/Uber-blog-parser";
import { getCategory, getCategoryKeys } from "./helpers/Dev-to-categories";
import express from "express";
import request from "request-promise";

const app = express();
const port = 3000;

app.get('/source/dev-to/:category?', async (req, res, next) => {
  try {
    const baseUrl = 'https://dev.to';
    const category = getCategory(req.params.category);
    const url = category ? baseUrl + '/' + category : baseUrl;
    const html = await request(url);
    res.send(await parseDevto(html, baseUrl));
  } catch (error) {
    next(error);
  }
});

app.get('/source/netflix', async (_, res, next) => {
  try {
    const url = 'https://netflixtechblog.com/';
    const html = await request(url);
    res.send(await parseNetflix(html));
  } catch (error) {
    next(error);
  }
});

app.get('/source/uber', async (_, res, next) => {
  try {
    const url = 'https://eng.uber.com/';
    const html = await request(url);
    res.send(await parseUber(html));
  } catch (error) {
    next(error);
  }
});

app.get('/info/source/dev-to/category/keys', async (_, res) => {
  res.send(getCategoryKeys());
});

app.get('/info/source/keys', async (_, res) => {
  res.send(['dev-to', 'netflix', 'uber']);
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
