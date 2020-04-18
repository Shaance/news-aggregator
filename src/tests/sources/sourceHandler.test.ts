import moxios from 'moxios';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';
import source from '../../sources/sourceHandler';
import { getHackerNewsCategory, getDevToCategory } from '../../helpers/WebsiteCategories';

const sourceHandler = source(false);

describe('SourceHandler class', function () {

  beforeEach(function () {
    // import and pass your custom axios instance to this method
    moxios.install()
  })

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall()
  })

  it('should call the right URL and numberOfArticles slice results when androidPolice method is called', function (done) {

    // two articles from html
    const pathToSample = path.join('src', 'tests', 'res', 'android-police-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    moxios.stubRequest('https://www.androidpolice.com/', {
      status: 200,
      responseText: fakeResponse
    });

    const onFulfilled = sinon.spy();
    const numberOfArticles = 1;

    sourceHandler.androidPolice(numberOfArticles, false).then(onFulfilled);

    moxios.wait(function () {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
      done();
    });
  })

  it('should call the right URL, resolve right category and numberOfArticles slice results when hackernews method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'hacker-news-item-sample.json');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');
    const category = 'new';

    moxios.stubRequest(`https://hacker-news.firebaseio.com/v0/${getHackerNewsCategory(category)}.json`, {
      status: 200,
      responseText: "[1, 2]"
    });

    moxios.stubRequest(/^https:\/\/hacker-news.firebaseio.com\/v0\/item\/*/, {
      status: 200,
      responseText: fakeResponse
    });

    const onFulfilled = sinon.spy();
    const numberOfArticles = 1;

    sourceHandler.hackerNews(numberOfArticles, false, category).then(onFulfilled);

    moxios.wait(function () {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
      done();
    });
  });

  it('should call the right URL, and resolve right category when dev-to method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'dev-to-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');
    const category = 'month';

    moxios.stubRequest(`https://dev.to/${getDevToCategory(category)}`, {
      status: 200,
      responseText: fakeResponse
    });

    const onFulfilled = sinon.spy();
    sourceHandler.devTo(false, category).then(onFulfilled);

    moxios.wait(function () {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(4);
      done();
    });
  });

  it('should call the right URL when uber method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'uber-blog-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    moxios.stubRequest('https://eng.uber.com/', {
      status: 200,
      responseText: fakeResponse
    });

    const onFulfilled = sinon.spy();
    sourceHandler.uber(false).then(onFulfilled);

    moxios.wait(function () {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(2);
      done();
    });
  });

  it('should call the right URL netflix method is called', function (done) {

    const pathToSample = path.join('src', 'tests', 'res', 'netflix-blog-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    moxios.stubRequest('https://netflixtechblog.com/', {
      status: 200,
      responseText: fakeResponse
    });

    const onFulfilled = sinon.spy();
    sourceHandler.netflix(false).then(onFulfilled);

    moxios.wait(function () {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(3);
      done();
    });
  });

});
