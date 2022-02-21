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
    return Utils.getIdFromSelfHref(selfHref);
  }

  static getIdFromSelfHref(selfHref: string): string {
    return selfHref ? selfHref.split('/').pop() : '';
  }

  static getValueOfPath(obj:object, path: string): any {
    let value = obj;
    path.split('.').forEach(key => {
      value = value?.[key]
    });

    return value;
  }
}
