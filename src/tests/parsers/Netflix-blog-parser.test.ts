import { parse } from "../../parsers/Netflix-blog-parser";
import fs from "fs";
import path from "path";

const pathToSample = path.join('src', 'tests', 'res', 'netflix-blog-sample.html');
const encoding = 'UTF-8';

describe('Netflix-blog-parser', function () {
  it('parse function should return 3', async function () {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      let result = await parse(data);
      expect(result.length).toBe(3);
    });
  });

  it('parse function should return Article object with correct info', async function () {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      let result = await parse(data);
      const expected = {
        url: 'https://netflixtechblog.com/bringing-4k-and-hdr-to-anime-at-netflix-with-sol-levante' +
          '-fa68105067cd?source=collection_home---4------0-----------------------',
        title: 'Bringing 4K and HDR to Anime at Netflix with Sol Levante',
        date: new Date("2020-04-02T07:01:00.929Z"),
        source: 'Netflix'
      }
      expect(result[0]).toEqual(expected);
    });
  });

});