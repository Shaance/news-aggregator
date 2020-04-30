import {
  getUrlsFromPaginatedSource, sourceOptionsToString, getDevToCategory,
  getHackerNewsCategory, getDevToCategoryKeys, getHackerNewsCategoryKeys,
} from '../../helpers/SourceHelper';
import SourceOptionsBuilder from '../../helpers/SourceOptionsBuilder';

describe('SourceHelper getPagesFromArticleNumbers function', () => {
  it('should return original url if number of articles is < 10', () => {
    const url = 'testurl.com';
    const result1 = getUrlsFromPaginatedSource(url, -30, 10, '/page/');
    const result2 = getUrlsFromPaginatedSource(url, 5, 10, '/page/');
    const expected = [url];
    expect(result1).toEqual(expected);
    expect(result2).toEqual(expected);
  });

  it('should return original url + pages if number of articles is > 10', () => {
    const url = 'testurl.com';
    const result = getUrlsFromPaginatedSource(url, 25, 10, '/page/');
    const expected = [url, `${url}/page/2`, `${url}/page/3`];
    expect(result).toEqual(expected);
  });
});

describe('SourceHelper sourceOptionsToString function', () => {
  it('should return correct info from sourceOptions object', () => {
    const options = new SourceOptionsBuilder()
      .withArticleNumber(3)
      .withForceFreshFlag()
      .withCategory('month')
      .build();

    const res = sourceOptionsToString(options);
    const { forceRefresh, category, numberOfArticles } = options;
    expect(res).toEqual(`forceRefresh: ${forceRefresh}, category:${category}, numberOfArticles: ${numberOfArticles}`);
  });
});

describe('SourceHelper getDevToCategory function', () => {
  it('should return empty string if key is undefined', () => {
    const res = getDevToCategory(undefined);
    expect(res).toEqual('');
  });

  it('should return empty string if key is not part of existing categories', () => {
    const res = getDevToCategory('wrongKey');
    expect(res).toEqual('');
  });

  it('should return non empty string for existing categories', () => {
    getDevToCategoryKeys().forEach((key) => {
      const res = getDevToCategory(key);
      expect(res).toBeTruthy();
    });
  });
});

describe('SourceHelper getHackerNewsCategory function', () => {
  it('should return empty string if key is undefined', () => {
    const res = getHackerNewsCategory(undefined);
    expect(res).toEqual('');
  });

  it('should return empty string if key is not part of existing categories', () => {
    const res = getHackerNewsCategory('wrongKey');
    expect(res).toEqual('');
  });

  it('should return non empty string for existing categories', () => {
    getHackerNewsCategoryKeys().forEach((key) => {
      const res = getHackerNewsCategory(key);
      expect(res).toBeTruthy();
    });
  });
});
