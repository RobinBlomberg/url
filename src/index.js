/**
 * @typedef {import('./types').UrlSchema} UrlSchema
 * @typedef {import('./types').Query} Query
 */

const SPLIT_PATH_REGEXP = /^\/?(.*?)\/?$/;
const URL_RGX = /^(?:([^:]+:)\/\/)?(?:([^:]+):([^@]+)@)?([^:/?#]+)?(?::([^/?#]+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;

/**
 * Utility class for handling URLs.
 */
export class Url {
  /**
   * @param {string} path
   * @return {string}
   */
  static normalizePath(path) {
    return '/' + this.splitPath(path).join('/');
  }

  /**
   * @param {string} url
   * @return {UrlSchema}
   */
  static parse(url) {
    const match = url.match(URL_RGX) ?? [];
    const protocol = match[1] || '';
    const username = match[2] || '';
    const password = match[3] || '';
    const hostname = match[4] || '';
    const port = match[5] || '';
    const pathname = match[6] || '/';
    const search = match[7] || '';
    const hash = match[8] || '';
    const host = `${hostname}${port ? `:${port}` : ''}`;
    const scheme = protocol ? `${protocol}//` : '';
    const origin = `${scheme}${host}`;
    const userinfo = username ? `${username}:${password}@` : '';
    const href = `${scheme}${userinfo}${host}${pathname}${search}${hash}`;
    const searchParams = this.parseQuery(search);

    return {
      hash,
      host,
      hostname,
      href,
      origin,
      password,
      pathname,
      port,
      protocol,
      search,
      searchParams,
      username
    };
  }

  /**
   * @param {string} query
   * @return {Object.<string, string>}
   */
  static parseQuery(query) {
    if (query[0] === '?') {
      query = query.slice(1);
    }

    /** @type {Object.<string, string>} */
    const searchParams = {};

    if (query) {
      for (const pair of query.split('&')) {
        const [key, value] = pair.split('=');
        searchParams[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }

    return searchParams;
  }

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

  /**
   * @param {Partial<UrlSchema>} [options]
   * @return {string}
   */
  static stringify({
    hash = '',
    host = '',
    hostname = '',
    href = '',
    origin = '',
    password = '',
    pathname = '',
    port,
    protocol = '',
    search = '',
    searchParams = {},
    username = ''
  } = {}) {
    if (href) {
      return href;
    }

    if (protocol && !protocol.endsWith(':')) {
      protocol += ':';
    }

    if (!host) {
      host = hostname.split(':')[0];
    }

    if (!host.includes(':') && port) {
      host += `:${port}`;
    }

    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }

    if (!search) {
      const query = this.stringifyQuery(searchParams);

      if (query) {
        search = '?' + query;
      }
    }

    let scheme = protocol
      ? `${protocol}//`
      : '';

    if (!scheme && !host && origin) {
      const tokens = origin.split('//');
      scheme = tokens[0]
        ? `${tokens[0]}//`
        : '';
      host = tokens[1] || '';
    }

    const userinfo = username || password
      ? `${username}:${password}@`
      : '';
    const hashString = hash
      ? `#${hash}`
      : '';
    return `${scheme}${userinfo}${host}${pathname}${search}${hashString}`;
  }

  /**
   * @param {Query} query
   * @return {string}
   */
  static stringifyQuery(query = {}) {
    const pairs = Object.entries(query);

    if (pairs.length === 0) {
      return '';
    }

    pairs.sort(([a], [b]) => {
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }

      return 0;
    });

    let output = '';

    for (let i = 0; i < pairs.length; i++) {
      if (i >= 1) {
        output += '&';
      }

      const [key, value] = pairs[i];

      if (value != null && value !== false) {
        output += encodeURIComponent(key);
        output += '=';
        output += encodeURIComponent(value);
      }
    }

    return output;
  }
}
