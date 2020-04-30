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
  const data = $('.entry-title').toArray().slice(1)
    .flatMap((datum) => datum.children.filter(((c) => c.name === 'div')))
    .flatMap((datum) => datum.children.filter((c) => c.attribs?.rel === 'bookmark'));
  const dates = $('time').toArray();
  const images = $('.attachment-thumbnail.size-thumbnail').toArray();

  data.forEach((datum, idx) => {
    results.push({
      url: datum.attribs.href,
      title: clean(datum.children[0].data),
      date: new Date(dates[idx].attribs.datetime),
      imageUrl: images[idx].attribs['data-src'],
      source: 'Facebook',
    });
  });

  return results;
}

export default parse;
