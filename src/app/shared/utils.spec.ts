import {HalDoc} from "@shared/models/hateoas";
import Utils from './utils';


describe('Utils', () => {
  describe('isUrl', () => {
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

    it(`should return false for a text starting with http but not a valid URL`, () => {
      const invalidUrl = 'httpsomething';

      expect(Utils.isUrl(invalidUrl)).toEqual(false);
    });

    it(`should return true for a valid URL`, () => {
      const invalidUrl = 'http://example.com';

      expect(Utils.isUrl(invalidUrl)).toEqual(true);
    });
  });

  describe('getLinkHref', ()=>{
    it(`should return href given a HAL document`, () => {
      const doc : HalDoc = {
        _links: {
          self: {
            href: 'href'
          }
        }
      }

      expect(Utils.getLinkHref(doc, 'self')).toEqual('href');
    });
  });

  describe('getIdFromHalDoc', ()=>{
    it(`should return href given a HAL document`, () => {
      const doc : HalDoc = {
        _links: {
          self: {
            href: 'url/id'
          }
        }
      }
      expect(Utils.getIdFromHalDoc(doc)).toEqual('id');
    });
  });

});
