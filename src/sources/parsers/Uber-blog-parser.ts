import { load } from 'cheerio';
import { Article } from '../../@types/Article';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const articleModules = $('.td_module_12.td_module_wrap.td-animation-stack').toArray()
    .map((elem) => elem.children[1].children[1]);
  const authors = articleModules.map((module) => module.next.next.children[1].children.filter((child) => child.type === 'tag')
    .map((tag) => tag.children[0].data).join(', '));
  const data = articleModules.map((module) => module.children[0]);
  const dates = $('time').toArray();

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: datum.attribs.title,
      date: new Date(dates[idx].attribs.datetime),
      author: authors[idx],
      source: 'Uber',
    });
  });

  return results;
}

export default parse;
