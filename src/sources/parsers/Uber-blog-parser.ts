import { load } from 'cheerio';
import { Article } from '../../@types/Article';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const articleModule = $('.td_module_12.td_module_wrap.td-animation-stack').toArray()
    .map((s) => s.children[1].children[1]);
  const authors = articleModule.map((d) => d.next.next.children[1].children.filter((child) => child.type === 'tag')
    .map((tag) => tag.children[0].data).join(', '));
  const data = articleModule.map((datum) => datum.children[0]);
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
