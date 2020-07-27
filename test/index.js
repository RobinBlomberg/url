const Url = require('..')
const { deepEqual, describe, it } = require('../../test/test')

describe('parse', () => {
  it('should parse correctly', () => {
    deepEqual(
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
    )
    deepEqual(
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
    )
    deepEqual(
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
    )
    deepEqual(
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
    )
  })

  it('should decode percent-encoded characters', () => {
    deepEqual(
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
    )
  })
})

describe('stringifyQuery', () => {
  it('should return an empty string if the query is empty', () => {
    deepEqual(
      Url.stringifyQuery(),
      ''
    )
  })

  it('should sort the query alphabetically', () => {
    deepEqual(
      Url.stringifyQuery({
        zzz: 34,
        // eslint-disable-next-line sort-keys
        foo: 'Hello world!'
      }),
      '?foo=Hello%20world!&zzz=34'
    )
  })

  it('should stringify Map objects in insertion order', () => {
    deepEqual(
      Url.stringifyQuery(
        new Map([
          ['ghi', 'jkl'],
          ['abc', 'def']
        ])
      ),
      '?ghi=jkl&abc=def'
    )
  })
})

describe('stringify', () => {
  deepEqual(
    Url.stringify(),
    '/'
  )
  deepEqual(
    Url.stringify(
      Url.parse('http://a:b@localhost:3000/test/index.php?id=36&a=b#top')
    ),
    'http://a:b@localhost:3000/test/index.php?id=36&a=b#top'
  )
  deepEqual(
    Url.stringify({
      href: 'https://example.com'
    }),
    'https://example.com'
  )
  deepEqual(
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
  )
  deepEqual(
    Url.stringify({
      origin: 'https://example.com',
      password: 'bar',
      username: 'foo'
    }),
    'https://foo:bar@example.com/'
  )
})
