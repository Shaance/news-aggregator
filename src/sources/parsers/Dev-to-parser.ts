import { load } from 'cheerio';
import { Article } from '../../@types/Article';
import { capitalize, clean } from '../../helpers/String';

const baseUrl = 'https://dev.to';

/*
* We get this as input /domenicosolazzo/i-got-the-job-3-tips-on-how-you-can-get-your-dream-job-4dl2
* and need to transform it to i got the job 3 tips on how you can get your dream job
*/
function extractTitleFromUrl(url: string) {
  const regex: RegExp = /^\/.+\/((\w|\d)+-)+/;
  if (regex.test(url)) {
    const res = url.split('/')[2].split('-');
    res.pop(); // last id part
    res[0] = capitalize(res[0]);
    return res.join(' ');
  }
  return '';
}

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const metadata = $('time').toArray();

  let articleLinks = $('h2.crayons-story__title')
    .children('a')
    .toArray();

  // TODO investigate why the first element is duplicated?
  if (articleLinks.length > metadata.length) {
    articleLinks = articleLinks.slice(1);
  }

  const authors = $('.crayons-story__meta')
    .children()
    .filter((_idx, elem) => elem.attribs?.class !== 'crayons-story__author-pic')
    .children('p')
    .children('a')
    .toArray()
    .map((elem) => elem.firstChild.data);

  const titles = articleLinks
    .map((elem) => elem.lastChild.data);

  articleLinks.forEach((elem, idx) => {
    const title = clean(titles[idx]);
    const author = clean(authors[idx]);
    const date = new Date(metadata[idx].attribs.datetime as string);
    results.push({
      url: baseUrl + elem.attribs.href,
      title: title !== '' ? title : extractTitleFromUrl(elem.attribs.href),
      author,
      date,
      source: 'dev-to',
    });
  });
  return results;
}

export default parse;
