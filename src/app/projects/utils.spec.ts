import Utils from './utils';

describe('Utils', () => {

  it(`should return a range of numbers from 1 to 5`, () => {
    expect(Utils.generateNumbers1toN(5)).toEqual([1,2,3,4,5]);
  });

});
