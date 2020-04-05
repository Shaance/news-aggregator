import { parse } from "./devto/Dev-to-parser"
import { getCategory } from "./devto/Dev-to-categories"
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
    res.send(await parse(html, url));
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => console.log(`Blablabla app listening at http://localhost:${port}`))
