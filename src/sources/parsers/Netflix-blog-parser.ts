import { load } from 'cheerio';
import { Article } from '../../@types/Article';
import { clean } from '../../helpers/String';

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);
  const links = $('a').toArray().filter((elem) => elem.attribs['data-post-id']);
  const dates = $('time').toArray();
  const articleElement = $('.col.u-xs-size12of12').toArray().map((elem) => elem.children);

  /* Netflix has the 1st article formed from 2 article elements instead of 1 for all other articles
   * The first element has the image the second one is only text
   */
  articleElement.splice(1, 1);
  const authors = $('.u-fontSize18.u-letterSpacingTight.u-lineHeightTight').toArray().map((elem) => elem.children[0].data);
  const titles = $('.u-letterSpacingTight.u-lineHeightTighter.u-breakWord.u-textOverflowEllipsis')
    .toArray().map((title) => title.children[0]);

  titles.forEach((title, idx) => {
    const article: Article = {
      title: clean(title.data as string),
      url: links[idx].attribs.href,
      date: new Date(dates[idx].attribs.datetime),
      author: clean(authors[idx]).replace(/(By |by )/, ''),
      source: 'Netflix',
    };

    // Netflix first article is constructed in different way
    if ((idx === 0 && articleElement[idx].length === 1) || articleElement[idx]?.length === 2) {
      const { style } = articleElement[idx][0].children[0].attribs;
      article.imageUrl = extractImageUrlFromStyleElement(style);
    }

    results.push(article);
  });
  return results;
}

/**
 * Extract the image URL from styleElement
 * @param styleElement has this form: background-image: url("https://cdn-images-1.medium.com/max/600/0*WZ1vxLVGroExYsuT"); background-position: 50% 50% !important;
 */
function extractImageUrlFromStyleElement(styleElement: string) {
  const regex: RegExp = /url\("(.+)"/;
  return styleElement.match(regex)[1];
}

export default parse;
