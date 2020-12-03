import { describe, equal, it } from '@robinblomberg/test';
import { Url } from './src/index.js';

describe('Url.parse', () => {
  it('should parse correctly', () => {
    equal(
      Url.parse('http://localhost:3000/test/index.php?id=36&a=b#top'),
      {
        hash: '#top',
        host: 'localhost:3000',
        hostname: 'localhost',
        href: 'http://localhost:3000/test/index.php?id=36&a=b#top',
        origin: 'http://localhost:3000',
        password: '',
        pathname: '/test/index.php',
        port: '3000',
        protocol: 'http:',
        search: '?id=36&a=b',
        searchParams: {
          a: 'b',
          id: '36'
        },
        username: ''
      }
    );
    equal(
      Url.parse('ftp://username:password@mysite.co.uk'),
      {
        hash: '',
        host: 'mysite.co.uk',
        hostname: 'mysite.co.uk',
        href: 'ftp://username:password@mysite.co.uk/',
        origin: 'ftp://mysite.co.uk',
        password: 'password',
        pathname: '/',
        port: '',
        protocol: 'ftp:',
        search: '',
        searchParams: {},
        username: 'username'
      }
    );
    equal(
      Url.parse('ftp://username@mysite.co.uk'),
      {
        hash: '',
        host: 'mysite.co.uk',
        hostname: 'mysite.co.uk',
        href: 'ftp://username@mysite.co.uk/',
        origin: 'ftp://mysite.co.uk',
        password: '',
        pathname: '/',
        port: '',
        protocol: 'ftp:',
        search: '',
        searchParams: {},
        username: 'username'
      }
    );
    equal(
      // eslint-disable-next-line max-len
      Url.parse('https://nodejs.org/api/http.html#http_http_request_url_options_callback'),
      {
        hash: '#http_http_request_url_options_callback',
        host: 'nodejs.org',
        hostname: 'nodejs.org',
        // eslint-disable-next-line max-len
        href: 'https://nodejs.org/api/http.html#http_http_request_url_options_callback',
        origin: 'https://nodejs.org',
        password: '',
        pathname: '/api/http.html',
        port: '',
        protocol: 'https:',
        search: '',
        searchParams: {},
        username: ''
      }
    );
    equal(
      Url.parse('/?'),
      {
        hash: '',
        host: '',
        hostname: '',
        href: '/?',
        origin: '',
        password: '',
        pathname: '/',
        port: '',
        protocol: '',
        search: '?',
        searchParams: {},
        username: ''
      }
    );
  });

  it('should decode percent-encoded characters', () => {
    equal(
      Url.parse('http://test.com/?a%20b=my%20image.png'),
      {
        hash: '',
        host: 'test.com',
        hostname: 'test.com',
        href: 'http://test.com/?a%20b=my%20image.png',
        origin: 'http://test.com',
        password: '',
        pathname: '/',
        port: '',
        protocol: 'http:',
        search: '?a%20b=my%20image.png',
        searchParams: {
          'a b': 'my image.png'
        },
        username: ''
      }
    );
  });
});

describe('Url.stringifyQuery', () => {
  it('should return an empty string if the query is empty', () => {
    equal(
      Url.stringifyQuery(),
      ''
    );
  });

  it('should sort the query alphabetically', () => {
    equal(
      Url.stringifyQuery({
        zzz: 34,
        // eslint-disable-next-line sort-keys
        foo: 'Hello world!'
      }),
      'foo=Hello%20world!&zzz=34'
    );
  });
});

describe('Url.stringify', () => {
  equal(
    Url.stringify(),
    '/'
  );
  equal(
    Url.stringify(
      Url.parse('http://a:b@localhost:3000/test/index.php?id=36&a=b#top')
    ),
    'http://a:b@localhost:3000/test/index.php?id=36&a=b#top'
  );
  equal(
    Url.stringify({
      href: 'https://example.com'
    }),
    'https://example.com'
  );
  equal(
    Url.stringify({
      hash: 'jumbotron',
      hostname: 'example.com:8083',
      password: 'doe',
      port: 8081,
      protocol: 'https',
      searchParams: {
        all: true,
        updated_since: new Date('2000-01-01').valueOf()
      },
      username: 'john'
    }),
    'https://john:doe@example.com:8081' +
    '/?all=true&updated_since=946684800000#jumbotron'
  );
  equal(
    Url.stringify({
      origin: 'https://example.com',
      password: 'bar',
      username: 'foo'
    }),
    'https://foo:bar@example.com/'
  );
});

describe('Url.split', () => {
  equal(
    Url.split('/'),
    []
  );
  equal(
    Url.split('/foo//bar/index.php'),
    ['foo', '', 'bar', 'index.php']
  );
  equal(
    Url.split('/foo//bar/index.php/'),
    ['foo', '', 'bar', 'index.php']
  );
  equal(
    Url.split('/api/User/[userId]'),
    ['api', 'User', '[userId]']
  );
  equal(
    Url.split('http://localhost:3000/test/index.php?id=36&a=b#top'),
    ['http://localhost:3000', 'test', 'index.php?id=36&a=b#top']
  );
});

/**
 * @see https://en.wikipedia.org/wiki/URI_normalization#Normalizations_that_preserve_semantics
 * @see https://tools.ietf.org/html/rfc3986
 */
describe('Url.normalize', () => {
  it('should convert percent-encoded triplets to uppercase', () => {
    equal(
      Url.normalize('http://example.com/foo%2a'),
      'http://example.com/foo%2A'
    );
  });

  it('should convert the scheme and host to lowercase', () => {
    equal(
      Url.normalize('HTTP://User@Example.COM/Foo'),
      'http://User@example.com/Foo'
    );
  });

  it('should decode percent-encoded triplets of unreserved characters', () => {
    equal(
      Url.normalize('http://example.com/%7Efoo'),
      'http://example.com/~foo'
    );
  });

  it('should remove dot-segments', () => {
    equal(
      Url.normalize('http://example.com/foo/./bar/baz/../qux'),
      'http://example.com/foo/bar/qux'
    );
  });

  it('should convert an empty path to a "/" path', () => {
    equal(
      Url.normalize('http://example.com'),
      'http://example.com/'
    );
  });

  it('should NOT add a trailing "/" to a non-empty path', () => {
    equal(
      Url.normalize('http://example.com/foo'),
      'http://example.com/foo'
    );
  });

  it('should remove the default port', () => {
    equal(
      Url.normalize('http://example.com:80'),
      'http://example.com/'
    );
    equal(
      Url.normalize('https://john:doe@example.com:443'),
      'https://john:doe@example.com/'
    );
  });
});
