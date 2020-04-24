/* eslint-disable @typescript-eslint/no-unused-vars */
import nock from 'nock';
import sinon from 'sinon';
import path from 'path';
import fs from 'fs';
import source from '../../sources/SourceHandler';
import { getHackerNewsCategory } from '../../helpers/SourceHelper';
import SourceOptionsBuilder from '../../helpers/SourceOptionsBuilder';

// TODO find a way to mock pupeeter

const sourceHandler = source();

describe('SourceHandler class', () => {
  it('should call the right URL and numberOfArticles slice results when androidPolice method is called', (done) => {
    // two articles from html
    const pathToSample = path.join('res', 'android-police-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    nock('https://www.androidpolice.com')
      .get('/')
      .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const numberOfArticles = 1;
    const options = new SourceOptionsBuilder().setNumberOfArticles(numberOfArticles).build();
    const promise = sourceHandler.androidPolice(options).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
      done();
    });
  });

  it('should call the right URL, resolve right category and numberOfArticles slice results when hackernews method is called', (done) => {
    const pathToSample = path.join('res', 'hacker-news-item-sample.json');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');
    const category = 'new';

    nock('https://hacker-news.firebaseio.com/v0')
      .get(`/${getHackerNewsCategory(category)}.json`)
      .reply(200, '[1, 2]');

    nock('https://hacker-news.firebaseio.com/v0')
      .get(/\/item\/*/)
      .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const numberOfArticles = 1;

    const options = new SourceOptionsBuilder()
      .setNumberOfArticles(numberOfArticles)
      .setCategory(category)
      .build();

    const promise = sourceHandler.hackerNews(options).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
      done();
    });
  });

  // it('should call the right URL and resolve category when dev-to method is called', (done) => {
  //   const pathToSample = path.join('res', 'dev-to-sample.html');
  //   const fakeResponse = fs.readFileSync(pathToSample, 'utf8');
  //   const category = 'month';

  //   const mockedDynamicHtmlLoaderInstance = {
  //     getFullHtml: (_url: string, _elementToTrack: string, _limit: number, _loadButton?: string) => {
  //       Promise.resolve(fakeResponse);
  //     },
  //   };
  //   const mockedSourceHandler = proxyquire(`../../${path.join('sources', 'SourceHandler.ts')}`, {
  //     './DynamicHtmlLoader': () => mockedDynamicHtmlLoaderInstance,
  //   });

  //   const numberOfArticles = 4;

  //   const options = new SourceOptionsBuilder()
  //     .setNumberOfArticles(numberOfArticles)
  //     .setCategory(category)
  //     .build();
  //   // nock('https://dev.to')
  //   // .get(`/${getDevToCategory(category)}`)
  //   // .reply(200, fakeResponse);

  //   spyOn(mockedDynamicHtmlLoaderInstance, 'getFullHtml');

  //   const onFulfilled = sinon.spy();
  //   const promise = mockedSourceHandler.devTo(options).then(onFulfilled);

  //   promise.then(() => {
  //     // expect(onFulfilled.getCall(0).args[0].length).toEqual(numberOfArticles);
  //     expect(mockedDynamicHtmlLoaderInstance.getFullHtml).toHaveBeenCalledWith(
  //       'https://dev.to',
  //       'time',
  //       4,
  //     );
  //     done();
  //   });
  // });

  it('should call the right URL when uber method is called', (done) => {
    const pathToSample = path.join('res', 'uber-blog-sample.html');
    const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

    nock('https://eng.uber.com')
      .get('/')
      .reply(200, fakeResponse);

    const onFulfilled = sinon.spy();
    const promise = sourceHandler.uber(new SourceOptionsBuilder().build()).then(onFulfilled);

    promise.then(() => {
      expect(onFulfilled.getCall(0).args[0].length).toEqual(2);
      done();
    });
  });

  // it('should call the right URL netflix method is called', (done) => {
  //   const pathToSample = path.join('res', 'netflix-blog-sample.html');
  //   const fakeResponse = fs.readFileSync(pathToSample, 'utf8');

  //   nock('https://netflixtechblog.com')
  //     .get('/')
  //     .reply(200, fakeResponse);

  //   const onFulfilled = sinon.spy();
  //   const promise = sourceHandler.netflix(new SourceOptionsBuilder().build()).then(onFulfilled);

  //   promise.then(() => {
  //     expect(onFulfilled.getCall(0).args[0].length).toEqual(3);
  //     done();
  //   });
  // });
});
