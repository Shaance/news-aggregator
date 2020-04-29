import SourceOptionsBuilder from '../../helpers/SourceOptionsBuilder';

describe('SourceOptionsBuilder', () => {
  it('should build with correct default values', () => {
    const res = new SourceOptionsBuilder().build();
    expect(res.forceRefresh).toEqual(false);
    expect(res.category).toBeUndefined();
  });
});

describe('SourceOptionsBuilder constructor', () => {
  it('should port over the properties set in the argument', () => {
    const source = new SourceOptionsBuilder()
      .withArticleNumber(99)
      .withForceFreshFlag()
      .withCategory('myCategory')
      .build();

    const res = new SourceOptionsBuilder(source).build();
    expect(res).toEqual(source);
  });
});
