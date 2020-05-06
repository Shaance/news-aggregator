/* eslint-disable arrow-body-style */
import { load } from 'cheerio';
import { Article } from '../../@types/Article';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const articleModules = $('.td_module_12.td_module_wrap.td-animation-stack')
    .children('.item-details');

  const authors = articleModules
    .children('.td-module-meta-info')
    .children('.coauthors.coauthors--byline')
    .toArray()
    .map((elem) => elem.children.filter((c) => c.name === 'a'))
    .map((elems) => {
      return elems.map((elem) => elem.firstChild.data).join(', ');
    });

  const data = articleModules
    .children('h3')
    .toArray()
    .map((module) => module.firstChild.attribs);
  const dates = $('time')
    .toArray()
    .map((elem) => elem.attribs.datetime);
  const images = $('.td-module-thumb')
    .children('.td-image-wrap')
    .children('img')
    .toArray()
    .map((elem) => elem.attribs['data-img-url']);

  data.forEach((datum, idx) => {
    results.push({
      url: datum.href,
      title: datum.title,
      date: new Date(dates[idx]),
      author: authors[idx],
      imageUrl: images[idx],
      source: 'uber',
    });
  });

  return results;
}

export default parse;
