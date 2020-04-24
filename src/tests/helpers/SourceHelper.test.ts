import { getUrlsFromPaginatedSource } from '../../helpers/SourceHelper';

describe('SourceHelper', () => {
  it('getPagesFromArticleNumbers function should return original url if number of articles is < 10', () => {
    const url = 'testurl.com';
    const result1 = getUrlsFromPaginatedSource(url, -30, 10);
    const result2 = getUrlsFromPaginatedSource(url, 5, 10);
    const expected = [url];
    expect(result1).toEqual(expected);
    expect(result2).toEqual(expected);
  });

  it('getPagesFromArticleNumbers function should return original url + pages if number of articles is > 10', () => {
    const url = 'testurl.com';
    const result = getUrlsFromPaginatedSource(url, 25, 10);
    const expected = [url, `${url}/page/2/`, `${url}/page/3/`];
    expect(result).toEqual(expected);
  });
});
