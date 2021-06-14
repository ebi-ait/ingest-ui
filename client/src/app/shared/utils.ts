export default class Utils {

  static isUrl(value: string) {
    try {
      const url = new URL(value);
    } catch (_) {
      return false;
    }
    return true;
  }
}
