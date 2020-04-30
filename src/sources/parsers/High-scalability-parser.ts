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
  const data = $('.journal-entry-wrapper')
    .toArray()
    .filter((entry) => !entry.attribs.class?.includes('sponsored'))
    .map((entry) => entry.children[1])
    .flatMap((datum) => datum.children.filter((c) => c.attribs?.class?.includes('journal-entry-text')));

  const titlesAndUrls = data.flatMap((entry) => entry.children.filter((c) => c.name === 'h2'))
    .flatMap((elem) => elem.children.filter((c) => c.name === 'a'));

  const images = data.flatMap((entry) => entry.children.filter((c) => c.attribs?.class === 'body'))
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
    .flatMap((entry) => entry.children.filter((c) => c.attribs?.class?.includes('journal-entry-tag')))
    .flatMap((elem) => elem.children.filter((c) => c.name === 'span'))
    .flatMap((elem) => elem.children.filter((c) => c.type === 'text' && c.data.length > 15))
    .map((elem) => elem.data);

  data.forEach((_, idx) => {
    const article: Article = {
      url: baseUrl + titlesAndUrls[idx].attribs.href,
      title: clean(titlesAndUrls[idx].children[0].data),
      date: parseDate(dates[idx].trim()),
      source: 'High scalability',
    };

    if (images[idx]) {
      article.imageUrl = images[idx];
    }

    results.push(article);
  });

  return results;
}

export default parse;
