import fs from 'fs';
import path from 'path';
import parse from '../../../sources/parsers/Netflix-blog-parser';

const pathToSample = path.join('src', 'tests', 'res', 'netflix-blog-sample.html');
const encoding = 'UTF-8';

describe('Netflix-blog-parser', () => {
  it('parse function should return 3', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      expect(result.length).toBe(3);
    });
  });

  it('parse function should return Article object with correct info', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      const expected = {
        url: 'https://netflixtechblog.com/bringing-4k-and-hdr-to-anime-at-netflix-with-sol-levante'
          + '-fa68105067cd?source=collection_home---4------0-----------------------',
        title: 'Bringing 4K and HDR to Anime at Netflix with Sol Levante',
        date: new Date('2020-04-02T07:01:00.929Z'),
        source: 'Netflix',
      };
      expect(result[0]).toEqual(expected);
    });
  });
});
