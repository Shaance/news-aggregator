import fs from 'fs';
import path from 'path';
import { getArticleFromStory } from '../../../sources/apis/HackerNewsApi';

const pathToItemSample = path.join('res', 'tests', 'hacker-news-item-sample.json');
const encoding = 'UTF-8';

describe('HackerNews api parse function', () => {
  it('should return Article object with correct info', async () => {
    fs.readFile(pathToItemSample, encoding, async (_, data) => {
      const result = getArticleFromStory(data);
      const expected = {
        url: 'https://churchlifejournal.nd.edu/articles/youre-a-slave-to-money-then-you-die/',
        title: "You're a Slave to Money, Then You Die",
        date: new Date('2020-04-12T10:58:14+00:00'),
        author: 'jxub',
        source: 'hackerNews',
      };
      expect(result[0]).toEqual(expected);
    });
  });
});
