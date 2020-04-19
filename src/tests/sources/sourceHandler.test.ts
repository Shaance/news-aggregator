import nock from "nock";
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';
import source from '../../sources/sourceHandler';
import { getHackerNewsCategory, getDevToCategory } from '../../helpers/WebsiteCategories';

const sourceHandler = source(false);

describe('SourceHandler class', function () {

  it('should call the right URL and numberOfArticles slice results when androidPolice method is called', function (done) {

    // two articles from html
    const pathToSample = path.join('src', 'tests', 'res', 'android-police-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    nock('https://www.androidpolice.com')
    .get('/')
    .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const numberOfArticles = 1;

    const promise = sourceHandler.androidPolice(numberOfArticles, false).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
      done();
    });
  })

  it('should call the right URL, resolve right category and numberOfArticles slice results when hackernews method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'hacker-news-item-sample.json');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');
    const category = 'new';

    nock('https://hacker-news.firebaseio.com/v0')
    .get(`/${getHackerNewsCategory(category)}.json`)
    .reply(200, "[1, 2]");

    nock('https://hacker-news.firebaseio.com/v0')
    .get(/\/item\/*/)
    .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const numberOfArticles = 1;

    const promise = sourceHandler.hackerNews(numberOfArticles, false, category).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
      done();
    });
  });

  it('should call the right URL, and resolve right category when dev-to method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'dev-to-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');
    const category = 'month';

    nock('https://dev.to')
    .get(`/${getDevToCategory(category)}`)
    .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const promise = sourceHandler.devTo(false, category).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(4);
      done();
    });
  });

  it('should call the right URL when uber method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'uber-blog-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    nock('https://eng.uber.com')
    .get('/')
    .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const promise = sourceHandler.uber(false).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(2);
      done();
    });
  });

  it('should call the right URL netflix method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'netflix-blog-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    nock('https://netflixtechblog.com')
      .get('/')
      .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const promise = sourceHandler.netflix(false).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(3);
      done();
    })
  });

});
