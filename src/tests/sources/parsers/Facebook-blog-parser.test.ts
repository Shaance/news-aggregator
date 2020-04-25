import fs from 'fs';
import path from 'path';
import parse from '../../../sources/parsers/Facebook-blog-parser';

const pathToSample = path.join('res', 'tests', 'facebook-blog-sample.html');
const encoding = 'UTF-8';

describe('Facebook-blog-parser', () => {
  it('should return 1 when parse function is called', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      expect(result.length).toBe(1); // first article is discarded as it's missing date
    });
  });

  it('parse function should return Article object with correct info', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      const expected = {
        url: 'https://engineering.fb.com/connectivity/mobile-world-congress-2020/',
        title: 'Accelerating innovations in infrastructure and advancing global connectivity with our partners',
        date: new Date('2020-03-02T00:00:00+01:00'),
        source: 'Facebook',
      };
      expect(result[0]).toEqual(expected);
    });
  });
});
