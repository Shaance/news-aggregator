import { Article } from "../@types/Article";
import { load } from "cheerio";
import { clean } from "../helpers/String";

export async function parse(html: string): Promise<Array<Article>> {
  const results: Article[] = [];
  const $ = load(html);
  const links = $("a").toArray().filter(elem => elem.attribs['data-post-id']);
  const dates = $("time").toArray();
  const titles = $(".u-letterSpacingTight.u-lineHeightTighter.u-breakWord.u-textOverflowEllipsis").toArray();
  titles.forEach((title, idx) => {
    results.push({
      title: clean(title.children[0].data as string),
      url: links[idx].attribs.href,
      date: new Date(dates[idx].attribs.datetime),
      source: 'netflix'
    });
  });
  return results;
}