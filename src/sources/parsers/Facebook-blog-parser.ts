import { load } from 'cheerio';
import { Article } from '../../@types/Article';
import { clean } from '../../helpers/String';

/**
 * Returns a list of Articles (1st article from this blog will be removed as Date is missing)
 * @param html the html file to parse from
 */
function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const data = $('.entry-title')
    .children('div')
    .children('a')
    .toArray()
    .slice(1);

  const dates = $('time')
    .toArray()
    .map((e) => e.attribs.datetime);

  const images = $('.attachment-thumbnail.size-thumbnail')
    .toArray()
    .map((e) => e.attribs['data-src']);

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: clean(datum.firstChild.data),
      date: new Date(dates[idx]),
      imageUrl: images[idx],
      source: 'Facebook',
    });
  });

  return results;
}

export default parse;
