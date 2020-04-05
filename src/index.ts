import { parse } from "./parsers/Dev-to-parser"
import { getCategory, getCategoryKeys } from "./helpers/Dev-to-categories"
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
    res.send(await parse(html, baseUrl));
  } catch (error) {
    next(error);
  }
});

app.get('/info/source/dev-to/category/keys', async (_, res) => {
  res.send(getCategoryKeys());
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
