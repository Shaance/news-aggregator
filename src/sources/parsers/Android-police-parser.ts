import { load } from 'cheerio';
import { Article } from '../../@types/Article';
import { clean } from '../../helpers/String';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const data = $('h2').toArray().filter((elem) => elem.attribs.itemprop)
    .map((datum) => datum.children[0]);
  const dates = $('time.timeago').toArray();
  const authors = $('a.author-name').toArray().map((elem) => elem.children[0].data);
  const images = $('.post-hero').toArray().map((elem) => elem.children[0]);

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: clean(datum.children[0].data as string),
      date: new Date(dates[idx].attribs.datetime),
      author: clean(authors[idx]),
      imageUrl: images[idx].attribs.src,
      source: 'Android Police',
    });
  });

  return results;
}

export default parse;
