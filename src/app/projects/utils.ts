export default class Utils {
  static generateNumbers1toN(n: number): number[] {
    return [...Array(n).keys()].map(i => ++i)
  }
}
