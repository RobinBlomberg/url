/* eslint-disable no-magic-numbers */
const { compare, entries, mSet } = require('@kjou/utility')

// eslint-disable-next-line max-len
const URL_RGX = /^(?:([^:]+:)\/\/)?(?:([^:]+):([^@]+)@)?([^:/?#]+)?(?::([^/?#]+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/

const parse = (url, useMap) => {
  const match = url.match(URL_RGX)
  const protocol = match[1] || ''
  const username = match[2] || ''
  const password = match[3] || ''
  const hostname = match[4] || ''
  const port = match[5] || ''
  const pathname = match[6] || '/'
  const search = match[7] || ''
  const hash = match[8] || ''
  const host = `${hostname}${port ? `:${port}` : ''}`
  const scheme = protocol ? `${protocol}//` : ''
  const origin = `${scheme}${host}`
  const userinfo = username ? `${username}:${password}@` : ''
  const href = `${scheme}${userinfo}${host}${pathname}${search}${hash}`
  const searchParams = parseQuery(search, useMap)

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
  }
}

const parseQuery = (query, useMap) => {
  if (query[0] === '?') {
    query = query.slice(1)
  }

  const searchParams = useMap ? new Map() : {}

  if (query) {
    for (const pair of query.split('&')) {
      const [key, value] = pair.split('=')
      mSet(searchParams, decodeURIComponent(key), decodeURIComponent(value))
    }
  }

  return searchParams
}

const stringify = ({
  hash = '',
  host = '',
  hostname = '',
  href = '',
  origin = '',
  password = '',
  pathname = '',
  port = '',
  protocol = '',
  search = '',
  searchParams = '',
  username = ''
} = {}) => {
  if (href) {
    return href
  }

  if (protocol && !protocol.endsWith(':')) {
    protocol += ':'
  }

  if (!host) {
    host = hostname.split(':')[0]
  }

  if (!host.includes(':') && port) {
    host += `:${port}`
  }

  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname
  }

  if (!search) {
    search = stringifyQuery(searchParams)
  }

  let scheme = protocol ? `${protocol}//` : ''

  if (!scheme && !host && origin) {
    const tokens = origin.split('//')
    scheme = tokens[0] ? `${tokens[0]}//` : ''
    host = tokens[1] || ''
  }

  const userinfo = username || password
    ? `${username}:${password}@`
    : ''
  const hashString = hash ? `#${hash}` : ''
  return `${scheme}${userinfo}${host}${pathname}${search}${hashString}`
}

const stringifyQuery = (query = {}) => {
  const pairs = entries(query)

  if (pairs.length === 0) {
    return ''
  }

  if (query.constructor === Object) {
    pairs.sort((a, b) => compare(a[0], b[0]))
  }

  let output = '?'

  for (let i = 0; i < pairs.length; i++) {
    if (i >= 1) {
      output += '&'
    }

    const [key, value] = pairs[i]
    output += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  }

  return output
}

module.exports = {
  parse,
  parseQuery,
  stringify,
  stringifyQuery
}
