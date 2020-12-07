/**
 * @typedef {import('../main').ParsedQuery} ParsedQuery
 * @typedef {import('../main').Query} Query
 * @typedef {import('../main').UrlSchema} UrlSchema
 */

const PERCENT_ENCODED_TRIPLETS_REGEXP = /%[A-Za-z0-9]{2}/g;
const SPLIT_PATH_REGEXP = /^\/?(.*?)\/?$/;
/** @see https://tools.ietf.org/html/rfc3986#section-2.3 */
const UNRESERVED_CHARACTER_REGEXP = /[A-Za-z0-9-._~]/;
const URL_REGEXP = /^(?:([^:]*:)\/\/)?(?:([^:]*)(?::([^@]*))?@)?([^:/?#]*)?(?::([^/?#]*))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;

/**
 * Utility class for handling URLs.
 */
export class Url {
  /**
   * @param {...string} urls
   * @return {string}
   * @example
   * equal(
   *   Url.join('/foo//bar/index.php/', 'http://api/User/[userId]/'),
   *   '/foo//bar/index.php/User/[userId]'
   * );
   */
  static join(...urls) {
    if (urls.length === 0) {
      return '/';
    }

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
   * @example
   * equal(
   *   Url.normalize('HTTPS://User＠Example.COM:443/%7Efoo%2a/./bar/baz/../qux'),
   *   'https://User＠example.com/~foo%2A/bar/qux'
   * );
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
   * @example
   * equal(
   *   Url.parse('http://localhost:3000/test/index.php?id=36&a=b#top'),
   *   {
   *     hash: '#top',
   *     host: 'localhost:3000',
   *     hostname: 'localhost',
   *     href: 'http://localhost:3000/test/index.php?id=36&a=b#top',
   *     origin: 'http://localhost:3000',
   *     password: '',
   *     pathname: '/test/index.php',
   *     port: '3000',
   *     protocol: 'http:',
   *     search: '?id=36&a=b',
   *     searchParams: {
   *       a: 'b',
   *       id: '36'
   *     },
   *     username: ''
   *   }
   * );
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
   * @return {ParsedQuery}
   * @example
   * equal(
   *   Url.parseQuery('?id=36&a=b'),
   *   {
   *     a: 'b',
   *     id: '36'
   *   }
   * );
   */
  static parseQuery(query) {
    if (query[0] === '?') {
      query = query.slice(1);
    }

    /** @type {ParsedQuery} */
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
   * @param {string} [url]
   * @return {string[]}
   * @example
   * equal(
   *   Url.split('/foo//bar/index.php/'),
   *   ['foo', '', 'bar', 'index.php']
   * );
   *
   * equal(
   *   Url.split('http://localhost:3000/test/index.php?id=36&a=b#top'),
   *   ['http://localhost:3000', 'test', 'index.php']
   * );
   */
  static split(url = '') {
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
   * @example
   * equal(
   *   Url.stringify({
   *     hash: 'jumbotron',
   *     hostname: 'example.com:8083',
   *     password: 'doe',
   *     port: 8081,
   *     protocol: 'https',
   *     searchParams: {
   *       all: true,
   *       updated_since: new Date('2000-01-01').valueOf()
   *     },
   *     username: 'john'
   *   }),
   *   'https://john:doe＠example.com:8081/?all=true&updated_since=946684800000#jumbotron'
   * );
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

    if (hash && hash[0] !== '#') {
      hash = '#' + hash;
    }

    return scheme + userinfo + host + pathname + search + hash;
  }

  /**
   * @param {Query} [query]
   * @return {string}
   * @example
   * equal(
   *   Url.stringifyQuery({
   *     'a b': 'my image.png',
   *     foo: 'test'
   *   }),
   *   'a%20b=my%20image.png&foo=test'
   * );
   */
  static stringifyQuery(query = {}) {
    const pairs = Object.entries(query);

    if (pairs.length === 0) {
      return '';
    }

    // Sort query alphabetically:
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
