const is = require('check-more-types')

const isUrlOrPort = input => {
  const str = is.string(input) ? input.split('|') : [input]

  return str.every(s => {
    if (is.url(s)) {
      return s
    }
    if (is.number(s)) {
      return is.port(s)
    }
    if (!is.string(s)) {
      return false
    }
    if (s[0] === ':') {
      const withoutColon = s.substr(1)
      return is.port(parseInt(withoutColon))
    }
    return is.port(parseInt(s))
  })
}

const normalizeUrl = input => {
  const str = is.string(input) ? input.split('|') : [input]

  return str.map(s => {
    if (is.url(s)) {
      return s
    }

    if (is.number(s) && is.port(s)) {
      return `http://localhost:${s}`
    }

    if (!is.string(s)) {
      return s
    }

    if (is.port(parseInt(s))) {
      return `http://localhost:${s}`
    }

    if (s[0] === ':') {
      return `http://localhost${s}`
    }
    // for anything else, return original argument
    return s
  })
}

module.exports = {
  isUrlOrPort: isUrlOrPort,
  normalizeUrl: normalizeUrl
}
