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
}
