/**
 * Internal types
 * -------------------------------------------------------------------------------------------------
 */

export type ParsedQuery = {
  [K: string]: string;
};

/**
 * Models the built-in URL object.
 */
export type UrlSchema = {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  password: string;
  pathname: string;
  port: number | string | undefined;
  protocol: string;
  search: string;
  searchParams: Query;
  username: string;
};

export type Query = {
  [K: string]: boolean | number | string | undefined;
};

/**
 * External types
 * -------------------------------------------------------------------------------------------------
 */

/**
 * Utility class for handling URLs.
 */
export class Url {
  /**
   * @example
   * equal(
   *   Url.join('/foo//bar/index.php/', 'http://api/User/[userId]/'),
   *   '/foo//bar/index.php/User/[userId]'
   * );
   */
  static join(...urls: string[]): string;

  /**
   * @see https://en.wikipedia.org/wiki/URI_normalization#Normalizations_that_preserve_semantics
   * @see https://tools.ietf.org/html/rfc3986
   * @example
   * equal(
   *   Url.normalize('HTTPS://User＠Example.COM:443/%7Efoo%2a/./bar/baz/../qux'),
   *   'https://User＠example.com/~foo%2A/bar/qux'
   * );
   */
  static normalize(url: string): string;

  /**
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
  static parse(url: string): UrlSchema;

  /**
   * @example
   * equal(
   *   Url.parseQuery('?id=36&a=b'),
   *   {
   *     a: 'b',
   *     id: '36'
   *   }
   * );
   */
  static parseQuery(query: string): ParsedQuery;

  /**
   * Splits an URL into its respective directories.
   *
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
  static split(url = ''): string[];

  /**
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
  static stringify(options?: Partial<UrlSchema>): string;

  /**
   * @example
   * equal(
   *   Url.stringifyQuery({
   *     'a b': 'my image.png',
   *     foo: 'test'
   *   }),
   *   'a%20b=my%20image.png&foo=test'
   * );
   */
  static stringifyQuery(query: Query = {}): string;
}
