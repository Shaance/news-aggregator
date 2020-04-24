import { load } from 'cheerio';
import { Article } from '../../@types/Article';
import { clean } from '../../helpers/String';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const links = $('a').toArray().filter((elem) => elem.attribs['data-post-id']);
  const dates = $('time').toArray();
  const authors = $('.u-fontSize18.u-letterSpacingTight.u-lineHeightTight').toArray().map((elem) => elem.children[0].data);
  const titles = $('.u-letterSpacingTight.u-lineHeightTighter.u-breakWord.u-textOverflowEllipsis')
    .toArray().map((title) => title.children[0]);
  titles.forEach((title, idx) => {
    results.push({
      title: clean(title.data as string),
      url: links[idx].attribs.href,
      date: new Date(dates[idx].attribs.datetime),
      author: clean(authors[idx]).replace('By ', ''),
      source: 'Netflix',
    });
  });
  return results;
}

export default parse;
