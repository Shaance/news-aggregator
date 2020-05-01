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
  const titles = $('h3')
    .toArray()
    .filter((h3) => h3.parent.attribs.class === 'content-wrapper' || h3.parent.attribs.class === 'content')
    .map((h3) => h3.firstChild.data);

  let articleLinks = $('a.index-article-link').toArray();
  // TODO investigate why the first element is duplicated?
  if (articleLinks.length > metadata.length) {
    articleLinks = articleLinks.slice(1);
  }

  articleLinks.forEach((elem, idx) => {
    const title = clean(titles[idx]);
    const author = clean(metadata[idx].prev.data);
    const date = new Date(metadata[idx].attribs.datetime as string);
    results.push({
      url: baseUrl + elem.attribs.href,
      title: title !== '' ? title : extractTitleFromUrl(elem.attribs.href),
      author,
      date,
      source: 'Dev.to',
    });
  });
  return results;
}

export default parse;
