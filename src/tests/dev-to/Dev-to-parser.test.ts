import { parse } from "../../parsers/Dev-to-parser";
import fs from "fs";
import path from "path";

const rewire = require("rewire");
const pathToSample = path.join('src', 'tests', 'res', 'dev-to-sample.html');
const encoding = 'UTF-8';

const rewired = rewire("../../devto/Dev-to-parser");

describe('Dev-to-parser', function () {
  it('parse function should return 4', async function () {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      let result = await parse(data, "toto");
      expect(result.length).toBe(4);
    });
  });

  it('parse function should return Article object with correct info', async function () {
    fs.readFile(pathToSample, encoding, async (_, data) => {
      let result = await parse(data, "toto");
      const expected = {
        url: 'toto/monicafidalgo/how-to-host-a-website-on-google-drive-for-free-1ejk',
        title: 'How to Host A Website On Google Drive for Free',
        author: '🦊 Atomic Fox',
        date: new Date("2020-04-04T17:14:56Z"),
        source: 'dev.to'
      }
      expect(result[0]).toEqual(expected);
    });
  });

  it('extractTitleFromUrl with invalid url format should return empty string', async function () {
    let result1 = await rewired.__get__("extractTitleFromUrl")('fdsfsfsd');
    let result2 = await rewired.__get__("extractTitleFromUrl")('/fdsfsfsd/sdadsa');
    expect(result1).toBe('');
    expect(result2).toBe('');
  });

  it('extractTitleFromUrl with valid format should remove the last id part', async function () {
    let result = await rewired.__get__("extractTitleFromUrl")('/author/my-article-is-cool-34dfg')
    expect(result).toBe('My article is cool');
  });
});