import { Article } from "../@types/Article";
import { load } from "cheerio";

export function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const data = $("h3.entry-title.td-module-title").toArray().map(datum => datum.children[0]);
  const dates = $("time").toArray();

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: datum.attribs.title,
      date: new Date(dates[idx].attribs.datetime),
      source: 'uber'
    });
  });

  return results;
}