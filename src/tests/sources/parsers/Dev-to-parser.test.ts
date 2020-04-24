/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import rewire from 'rewire';
import parse from '../../../sources/parsers/Dev-to-parser';

const pathToSample = path.join('res', 'dev-to-sample.html');
const encoding = 'UTF-8';
const rewired = rewire('../../../sources/parsers/Dev-to-parser');

describe('Dev-to-parser', () => {
  it('parse function should return 4', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      expect(result.length).toBe(4);
    });
  });

  it('parse function should return Article object with correct info', async () => {
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

  it('extractTitleFromUrl with invalid url format should return empty string', async () => {
    const result1 = await rewired.__get__('extractTitleFromUrl')('fdsfsfsd');
    const result2 = await rewired.__get__('extractTitleFromUrl')('/fdsfsfsd/sdadsa');
    expect(result1).toBe('');
    expect(result2).toBe('');
  });

  it('extractTitleFromUrl with valid format should remove the last id part', async () => {
    const result = await rewired.__get__('extractTitleFromUrl')('/author/my-article-is-cool-34dfg');
    expect(result).toBe('My article is cool');
  });
});
