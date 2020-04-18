import { parse } from "../../../sources/parsers/Uber-blog-parser";
import fs from "fs";
import path from "path";

const pathToSample = path.join('src', 'tests', 'res', 'uber-blog-sample.html');
const encoding = 'UTF-8';

describe('Uber-blog-parser', function () {
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
        url: 'https://eng.uber.com/piranha/',
        title: 'Introducing Piranha: An Open Source Tool to Automatically Delete Stale Code',
        date: new Date("2020-03-17T08:30:25+00:00"),
        source: 'Uber'
      }
      expect(result[0]).toEqual(expected);
    });
  });

});