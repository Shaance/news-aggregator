import fs from 'fs';
import path from 'path';
import parse from '../../../sources/parsers/Netflix-blog-parser';

const pathToSample = path.join('res', 'tests', 'netflix-blog-sample.html');
const encoding = 'UTF-8';

describe('Netflix-blog-parser parse function', () => {
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
        url: 'https://netflixtechblog.com/svt-av1-an-open-source-av1-encoder-and-decoder'
        + '-ad295d9b5ca2?source=collection_home---4------0-----------------------',
        title: 'SVT-AV1: an open-source AV1 encoder and decoder',
        author: 'Andrey Norkin, Joel Sole, Mariana Afonso, Kyle Swanson, Agata Opalach, Anush Moorthy, Anne Aaron',
        date: new Date('2020-03-13T17:21:00.833Z'),
        source: 'netflix',
      };
      expect(result[1]).toEqual(expected);
    });
  });
});
