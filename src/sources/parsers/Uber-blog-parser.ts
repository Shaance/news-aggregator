import { load } from 'cheerio';
import { Article } from '../../@types/Article';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const articleModules = $('.td_module_12.td_module_wrap.td-animation-stack').toArray()
    .flatMap((elem) => elem.children.filter((c) => c.attribs?.class === 'item-details'));

  const authors = articleModules
    .flatMap((elem) => elem.children.filter((c) => c.attribs?.class === 'td-module-meta-info'))
    .flatMap((elem) => elem.children.filter((c) => c.attribs?.class === 'coauthors coauthors--byline'))
    .map((elem) => elem.children.filter((c) => c.name === 'a'))
    .map((elems) => elems.map((elem) => elem.children[0].data).join(', '));

  const data = articleModules
    .flatMap((elem) => elem.children.filter((c) => c.name === 'h3'))
    .map((module) => module.children[0]);
  const dates = $('time').toArray();
  const images = $('.td-module-thumb').toArray()
    .flatMap((elem) => elem.children.filter((c) => c.attribs?.class === 'td-image-wrap'))
    .flatMap((elem) => elem.children.filter((c) => c.name === 'img'));

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: datum.attribs.title,
      date: new Date(dates[idx].attribs.datetime),
      author: authors[idx],
      imageUrl: images[idx].attribs['data-img-url'],
      source: 'Uber',
    });
  });

  return results;
}

export default parse;
