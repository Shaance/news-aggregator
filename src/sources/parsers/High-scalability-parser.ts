import { load } from 'cheerio';
import { Article } from '../../@types/Article';
import { clean } from '../../helpers/String';

const baseUrl = 'http://highscalability.com';

// 9:18AM
const twelveToTwentyFourHourFormat = (time: string) => {
  if (time) {
    const regex: RegExp = /(\d+):(\d+)(\w+)/;
    let hour = time.match(regex)[1];
    const minute = time.match(regex)[2];
    const period = time.match(regex)[3];
    if (parseInt(hour, 10) === 12) {
      hour = '00';
    }
    hour = period === 'PM' ? (parseInt(hour, 10) + 12).toString() : hour;
    return `${hour}:${minute}:00`;
  }
  return '';
};

// Monday, April 27, 2020 at 9:18AM
const parseDate = (date: string) => {
  const regex: RegExp = /\w+, (.+) at (.+)/;
  const hour = twelveToTwentyFourHourFormat(date.match(regex)[2]);

  return hour ? new Date(`${date.match(regex)[1]} ${hour}`) : null;
};

function parse(html: string): Article[] {
  const results: Article[] = [];
  const $ = load(html);

  const data = $('div')
    .filter('.journal-entry-wrapper')
    .not(() => $(this).attr('class') === 'sponsored')
    .children('.journal-entry')
    .children('.journal-entry-text')
    .filter('.journal-entry-text');

  const titlesAndUrls2 = data
    .children('h2')
    .children('a');

  const urls = titlesAndUrls2
    .toArray()
    .map((e) => e.attribs.href);

  const titles = titlesAndUrls2
    .toArray()
    .map((e) => e.firstChild.data);

  const images = data
    .children('.body')
    .toArray()
    .map((elem) => {
      const imageElem = elem.children.filter((c) => c.name === 'div' && c.attribs?.align === 'center');
      if (imageElem && imageElem.length > 0) {
        const youtubeEmbededContent = 'https://www.youtube.com/embed';
        const parsedImgSrc = imageElem[0].children[0].attribs?.src;
        return parsedImgSrc?.includes(youtubeEmbededContent) ? null : parsedImgSrc;
      }
      return null;
    });

  const dates = data
    .children('.journal-entry-tag')
    .children('.posted-on')
    .filter((_, e) => e.lastChild.data.length > 15)
    .toArray()
    .map((e) => e.lastChild.data);

  data.toArray().forEach((_, idx) => {
    const article: Article = {
      url: baseUrl + urls[idx],
      title: clean(titles[idx]),
      date: parseDate(dates[idx].trim()),
      source: 'highscalability',
    };

    if (images[idx]) {
      article.imageUrl = images[idx];
    }

    results.push(article);
  });

  return results;
}

export default parse;
