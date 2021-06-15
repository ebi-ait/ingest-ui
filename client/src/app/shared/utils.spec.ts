import Utils from './utils';


describe('Utils', () => {
  it(`should return false for an random text`, () => {
    const invalidUrl = 'some text that is not a URL';

    expect(Utils.isUrl(invalidUrl)).toEqual(false);
  });

  it(`should return false for an NCBI Taxon expression`, () => {
    const invalidUrl = 'NCBITAXON:10090';

    expect(Utils.isUrl(invalidUrl)).toEqual(false);
  });

  it(`should return false for a number`, () => {
    const invalidUrl = '42';

    expect(Utils.isUrl(invalidUrl)).toEqual(false);
  });

  it(`should return true for a valid URL`, () => {
    const invalidUrl = 'http://example.com';

    expect(Utils.isUrl(invalidUrl)).toEqual(true);
  });
});
