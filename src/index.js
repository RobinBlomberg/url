/**
 * @typedef {import('./types').UrlSchema} UrlSchema
 * @typedef {import('./types').Query} Query
 */

const PERCENT_ENCODED_TRIPLETS_REGEXP = /%[A-Za-z0-9]{2}/g;
const SPLIT_PATH_REGEXP = /^\/?(.*?)\/?$/;
/**
 * @see https://tools.ietf.org/html/rfc3986#section-2.3
 */
const UNRESERVED_CHARACTER_REGEXP = /[A-Za-z0-9-._~]/;
const URL_REGEXP = /^(?:([^:]*:)\/\/)?(?:([^:]*)(?::([^@]*))?@)?([^:/?#]*)?(?::([^/?#]*))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;

/**
 * Utility class for handling URLs.
 */
export class Url {
  /**
   * @param {...string} urls
   * @return {string}
   */
  static join(...urls) {
    let {
      hash,
      hostname,
      password,
      pathname,
      port,
      protocol,
      search,
      username
    } = this.parse(urls[0]);

    const pathnameTokens = this.split(pathname);

    for (let i = 1; i < urls.length; i++) {
      const currParsedUrl = this.parse(urls[i]);
      const currPathname = currParsedUrl.pathname;
      const currPathnameTokens = this.split(currPathname);

      pathnameTokens.push(...currPathnameTokens);

      hash = currParsedUrl.hash;
      search = currParsedUrl.search;
    }

    pathname = pathnameTokens.join('/');

    return this.stringify({
      hash,
      hostname,
      password,
      pathname,
      port,
      protocol,
      search,
      username
    });
  }

  /**
   * @param {string} url
   * @return {string}
   * @see https://en.wikipedia.org/wiki/URI_normalization#Normalizations_that_preserve_semantics
   * @see https://tools.ietf.org/html/rfc3986
   */
  static normalize(url) {
    const parsedUrl = this.parse(url);
    let {
      hash,
      hostname,
      password,
      pathname,
      port,
      protocol,
      search,
      searchParams,
      username
    } = parsedUrl;

    // Convert the scheme and host to lowercase:
    protocol = protocol.toLowerCase();
    hostname = hostname.toLowerCase();

    // Remove the default port:
    if ((protocol === 'http:' && port === '80') || (protocol === 'https:' && port === '443')) {
      port = '';
    }

    // Remove dot-segments:
    if (pathname?.length > 1) {
      const tokens = this.split(pathname);
      /** @type {string[]} */
      const newTokens = [];

      for (let i = 0; i < tokens.length; i++) {
        switch (tokens[i]) {
          case '.':
            break;
          case '..':
            newTokens.pop();
            break;
          default:
            newTokens.push(tokens[i]);
            break;
        }
      }

      pathname = '/' + newTokens.join('/');
    }

    let newUrl = this.stringify({
      hash,
      hostname,
      password,
      pathname,
      port,
      protocol,
      search,
      searchParams,
      username
    });

    newUrl = newUrl.replace(PERCENT_ENCODED_TRIPLETS_REGEXP, (match) => {
      const decodedCharacter = decodeURIComponent(match);

      return UNRESERVED_CHARACTER_REGEXP.test(decodedCharacter)
        // Decode percent-encoded triplets of unreserved characters:
        ? decodedCharacter
        // Convert percent-encoded triplets to uppercase:
        : match.toUpperCase();
    });

    return newUrl;
  }

  /**
   * @param {string} url
   * @return {UrlSchema}
   */
  static parse(url) {
    const match = url.match(URL_REGEXP) ?? [];
    const protocol = match[1] || '';
    const username = match[2] || '';
    const password = match[3] || '';
    const hostname = match[4] || '';
    const port = match[5] || '';
    const pathname = match[6] || '/';
    const search = match[7] || '';
    const hash = match[8] || '';
    const host = hostname + (port ? `:${port}` : '');
    const scheme = protocol ? `${protocol}//` : '';
    const origin = scheme + host;
    const userinfo = username ? `${username}${password ? `:${password}` : ''}@` : '';
    const href = scheme + userinfo + host + pathname + search + hash;
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
   * Splits an URL into its respective directories.
   *
   * @param {string} url
   * @return {string[]}
   * @example
   * Url.split('/foo//bar/index.php/');
   * // ['foo', '', 'bar', 'index.php']
   *
   * Url.split('http://localhost:3000/test/index.php?id=36&a=b#top');
   * // ['http://localhost:3000', 'test', 'index.php']
   */
  static split(url) {
    const { protocol } = this.parse(url);

    if (protocol) {
      const tokens = url.slice(protocol.length + 2).split('/');
      tokens[0] = protocol + '//' + tokens[0];
      return tokens;
    }

    return url.match(SPLIT_PATH_REGEXP)?.[1].split('/') ?? [];
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
      host += ':' + port;
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
      ? protocol + '//'
      : '';

    if (!scheme && !host && origin) {
      const tokens = origin.split('//');
      scheme = tokens[0]
        ? tokens[0] + '//'
        : '';
      host = tokens[1] || '';
    }

    const userinfo = username
      ? username + (password ? `:${password}` : '') + '@'
      : '';
    const hashString = hash
      ? '#' + hash
      : '';
    return scheme + userinfo + host + pathname + search + hashString;
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
