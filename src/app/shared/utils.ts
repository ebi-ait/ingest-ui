import {HalDoc} from "@shared/models/hateoas";

export default class Utils {

  static isUrl(value: string): boolean {
    if (!(value.toString().startsWith('http'))) {
      return false;
    }
    try {
      const url = new URL(value);
    } catch (_) {
      return false;
    }
    return true;
  }

  static getLinkHref(doc: HalDoc, link: string): string {
    return doc?._links?.[link]?.href;
  }

  static getIdFromHalDoc(doc: HalDoc): string {
    const selfHref = Utils.getLinkHref(doc, 'self');
    return selfHref ? selfHref.split('/').pop() : '';
  }

}
