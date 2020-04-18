import { Article } from "../../@types/Article";
import { load } from "cheerio";
import { clean } from "../../helpers/String";

export function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const data = $("h2").toArray().filter(elem => elem.attribs.itemprop)
    .map(datum => datum.children[0]);
  const dates = $("time.timeago").toArray();
  const authors = $("a.author-name").toArray().map(elem => elem.children[0].data);

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: clean(datum.children[0].data as string),
      date: new Date(dates[idx].attribs.datetime),
      author: clean(authors[idx]),
      source: 'Android Police'
    });
  });

  return results;
}

// 10 articles per pages on AndroidPolice
export function getPagesFromArticleNumbers(url: string, nbOfArticles: number): string[] {
  const pages = new Array<string>(url);
  if (nbOfArticles > 9) {
    let pageNumber = 2;
    let remainder = Math.floor(nbOfArticles / 10);
    while (remainder-- != 0) {
      pages.push(`${url}/page/${pageNumber++}/`);
    }
  }
  return pages;
}