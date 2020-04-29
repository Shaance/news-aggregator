/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import rewire from 'rewire';
import parse from '../../../sources/parsers/Dev-to-parser';

const pathToSample = path.join('res', 'tests', 'dev-to-sample.html');
const encoding = 'UTF-8';
const rewired = rewire('../../../sources/parsers/Dev-to-parser');

describe('Dev-to-parser parse function ', () => {
  it('should return 4 articles', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      expect(result.length).toBe(4);
    });
  });

  it('should return Article object with correct info', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      const expected = {
        url: 'https://dev.to/monicafidalgo/how-to-host-a-website-on-google-drive-for-free-1ejk',
        title: 'How to Host A Website On Google Drive for Free',
        author: '🦊 Atomic Fox',
        date: new Date('2020-04-04T17:14:56Z'),
        source: 'Dev.to',
      };
      expect(result[0]).toEqual(expected);
    });
  });
});

describe('Dev-to-parser extractTitleFromUrl function ', () => {
  it('should return empty string with invalid url format as parameter ', async () => {
    const result1 = await rewired.__get__('extractTitleFromUrl')('fdsfsfsd');
    const result2 = await rewired.__get__('extractTitleFromUrl')('/fdsfsfsd/sdadsa');
    expect(result1).toBe('');
    expect(result2).toBe('');
  });

  it('should remove the last id part with valid format as parameter', async () => {
    const result = await rewired.__get__('extractTitleFromUrl')('/author/my-article-is-cool-34dfg');
    expect(result).toBe('My article is cool');
  });
});
