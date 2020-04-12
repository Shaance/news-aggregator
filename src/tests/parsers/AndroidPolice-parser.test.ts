import { parse, getPagesFromArticleNumbers } from "../../parsers/Android-police-parser";
import fs from "fs";
import path from "path";

const pathToSample = path.join('src', 'tests', 'res', 'android-police-sample.html');
const encoding = 'UTF-8';

describe('AndroidPolice-blog-parser', function () {
  it('parse function should return 2', async function () {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      let result = parse(data);
      expect(result.length).toBe(2);
    });
  });

  it('parse function should return Article object with correct info', async function () {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      let result = parse(data);
      const expected = {
        url: 'https://www.androidpolice.com/2020/04/10/google-completely-ruined-shared-folders-in-drive/',
        title: 'Google completely ruined shared folders in Drive (Update: Workaround, Google shares longterm plan)',
        date: new Date("2020-04-10T03:15:39-07:00"),
        author: 'Rita El Khoury',
        source: 'Android Police'
      }
      expect(result[0]).toEqual(expected);
    });
  });

  it('getPagesFromArticleNumbers function should return original url if number of articles is < 10', function () {
    const url = 'testurl.com';
    const result1 = getPagesFromArticleNumbers(url, -30);
    const result2 = getPagesFromArticleNumbers(url, 5);
    const expected = [url];
    expect(result1).toEqual(expected);
    expect(result2).toEqual(expected);
  });

  it('getPagesFromArticleNumbers function should return original url + pages if number of articles is > 10', function () {
    const url = 'testurl.com';
    const result = getPagesFromArticleNumbers(url, 25);
    const expected = [url, `${url}/page/2/`, `${url}/page/3/`];
    expect(result).toEqual(expected);
  });

});