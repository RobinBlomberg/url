const SPLIT_PATH_REGEXP = /^\/?(.*?)\/?$/;

/**
 * Utility class for handling URLs.
 */
export class Url {
  /**
   * Splits an URL path into its respective directories.
   *
   * @param {string} path
   * @return {string[]}
   * @example
   * Url.splitPath('/foo//bar/index.php/');
   * // ['foo', '', 'bar', 'index.php']
   */
  static splitPath(path) {
    const match = path.match(SPLIT_PATH_REGEXP);
    return match?.[1].split('/') ?? [];
  }
}
