import fs from 'fs';
import path from 'path';
import parse from '../../../sources/parsers/High-scalability-parser';

const pathToSample = path.join('res', 'tests', 'high-scalability-sample.html');
const encoding = 'UTF-8';

describe('High-scalability-parser parse function', () => {
  it('should return 1 articles', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      expect(result.length).toBe(1);
    });
  });

  it('should return Article object with correct info', async () => {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      const result = parse(data);
      const expected = {
        url: 'http://highscalability.com/blog/2020/3/13/stuff-the-internet-says-on-scalability-for-march-13th-2020.html',
        title: 'Stuff The Internet Says On Scalability For March 13th, 2020',
        date: new Date('2020-03-13T09:10:00'),
        imageUrl: 'https://raw.githubusercontent.com/earthspecies/roadmaps/master/images/ai/10k_eng_med_opt.gif',
        source: 'highscalability',
      };
      expect(result[0]).toEqual(expected);
    });
  });
});
