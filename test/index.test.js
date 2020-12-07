import { describe, equal, it, test } from '@robinblomberg/test';
import { Url } from '../lib/index.js';

test('@robinblomberg/url', () => {
  describe('Url', () => {
    describe('parseQuery', () => {
      it('should skip a leading question mark', () => {
        equal(
          Url.parseQuery('?id=36&a=b'),
          {
            a: 'b',
            id: '36'
          }
        );
        equal(
          Url.parseQuery('id=36&a=b'),
          {
            a: 'b',
            id: '36'
          }
        );
      });
    });

    describe('parse', () => {
      it('should handle empty URLs', () => {
        equal(
          Url.parse(''),
          {
            hash: '',
            host: '',
            hostname: '',
            href: '/',
            origin: '',
            password: '',
            pathname: '/',
            port: '',
            protocol: '',
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

      it('should handle partial URLs', () => {
        equal(
          Url.parse('/foo/bar/index.php#top'),
          {
            hash: '#top',
            host: '',
            hostname: '',
            href: '/foo/bar/index.php#top',
            origin: '',
            password: '',
            pathname: '/foo/bar/index.php',
            port: '',
            protocol: '',
            search: '',
            searchParams: {},
            username: ''
          }
        );
        equal(
          Url.parse('www.google.com'),
          {
            hash: '',
            host: 'www.google.com',
            hostname: 'www.google.com',
            href: 'www.google.com/',
            origin: 'www.google.com',
            password: '',
            pathname: '/',
            port: '',
            protocol: '',
            search: '',
            searchParams: {},
            username: ''
          }
        );
        equal(
          Url.parse('localhost:3000'),
          {
            hash: '',
            host: 'localhost:3000',
            hostname: 'localhost',
            href: 'localhost:3000/',
            origin: 'localhost:3000',
            password: '',
            pathname: '/',
            port: '3000',
            protocol: '',
            search: '',
            searchParams: {},
            username: ''
          }
        );
      });

      it('should parse full URLs correctly', () => {
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
          Url.parse('https://nodejs.org/api/http.html#http_http_request_url_options_callback'),
          {
            hash: '#http_http_request_url_options_callback',
            host: 'nodejs.org',
            hostname: 'nodejs.org',
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
          Url.parse(
            'https://www.reddit.com/r/pics/comments/haucpf' +
            '/ive_found_a_few_funny_memories_during_lockdown/'
          ),
          {
            hash: '',
            host: 'www.reddit.com',
            hostname: 'www.reddit.com',
            href: 'https://www.reddit.com/r/pics/comments/haucpf' +
              '/ive_found_a_few_funny_memories_during_lockdown/',
            origin: 'https://www.reddit.com',
            password: '',
            pathname: '/r/pics/comments/haucpf/ive_found_a_few_funny_memories_during_lockdown/',
            port: '',
            protocol: 'https:',
            search: '',
            searchParams: {},
            username: ''
          }
        );
      });

      it('should decode percent-encoded characters correctly', () => {
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

    describe('stringifyQuery', () => {
      it('should return an empty string if the query is empty', () => {
        equal(
          Url.stringifyQuery(),
          ''
        );
      });

      it('should encode percent-encoded characters correctly', () => {
        equal(
          Url.stringifyQuery({
            'a b': 'my image.png',
            foo: 'test'
          }),
          'a%20b=my%20image.png&foo=test'
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

    describe('stringify', () => {
      it('should return a single slash if the options are empty', () => {
        equal(
          Url.stringify(),
          '/'
        );
        equal(
          Url.stringify({}),
          '/'
        );
      });

      it('should stringify correctly', () => {
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
          'https://john:doe@example.com:8081/?all=true&updated_since=946684800000#jumbotron'
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
    });

    describe('split', () => {
      it('should split empty URLs correctly', () => {
        equal(
          Url.split(),
          []
        );
        equal(
          Url.split(''),
          []
        );
      });

      it('should split paths correctly', () => {
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
      });

      it('should split full and partial URLs correctly', () => {
        equal(
          Url.split('www.example.com/index.php'),
          ['www.example.com', 'index.php']
        );
        equal(
          Url.split('localhost:3000/User//'),
          ['localhost:3000', 'User', '']
        );
        equal(
          Url.split('http://localhost:3000/test/index.php?id=36&a=b#top'),
          ['http://localhost:3000', 'test', 'index.php?id=36&a=b#top']
        );
      });
    });

    describe('join', () => {
      it('should join empty URLs correctly', () => {
        equal(
          Url.join(),
          '/'
        );
        equal(
          Url.join(''),
          '/'
        );
      });

      it('should join full and partial URLs correctly', () => {
        equal(
          Url.join('/foo//bar/index.php/', '/api/User/[userId]/'),
          '/foo//bar/index.php/api/User/[userId]'
        );
        equal(
          Url.join('http://test.com/foo//bar/index.php/', '/api/User/[userId]/'),
          'http://test.com/foo//bar/index.php/api/User/[userId]'
        );
        equal(
          Url.join('/foo//bar/index.php/', 'http://api/User/[userId]/'),
          '/foo//bar/index.php/User/[userId]'
        );
        equal(
          Url.join(
            'http://a:b@localhost:3000/test/index.php?id=36&a=b#top',
            'https://nodejs.org/api/http.html/#http_http_request_url_options_callback',
            '/foo//bar/index.php/?foo=bar'
          ),
          'http://a:b@localhost:3000/test/index.php/api/http.html/foo//bar/index.php?foo=bar'
        );
      });
    });

    /**
     * @see https://en.wikipedia.org/wiki/URI_normalization#Normalizations_that_preserve_semantics
     * @see https://tools.ietf.org/html/rfc3986
     */
    describe('normalize', () => {
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

      it('should respect all normalization rules at once', () => {
        equal(
          Url.normalize('HTTPS://User@Example.COM:443/%7Efoo%2a/./bar/baz/../qux'),
          'https://User@example.com/~foo%2A/bar/qux'
        );
      });
    });
  });
})();
