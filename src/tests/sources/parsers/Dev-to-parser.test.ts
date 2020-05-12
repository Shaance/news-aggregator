/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import rewire from 'rewire';
import parse from '../../../sources/parsers/Dev-to-parser';

const pathToSample = path.join('res', 'tests', 'dev-to-sample.html');
const encoding = 'UTF-8';
const rewired = rewire('../../../sources/parsers/Dev-to-parser');

describe('Dev-to-parser parse function ', () => {
  it('should return 2 articles', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      expect(result.length).toBe(2);
    });
  });

  it('should return Article object with correct info', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      const expected = {
        url: 'https://dev.to/ben/explain-deno-like-i-m-five-i4m',
        title: "Explain Deno Like I'm Five",
        author: 'Ben Halpern',
        date: new Date('2020-05-11T13:01:16Z'),
        source: 'dev-to',
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
