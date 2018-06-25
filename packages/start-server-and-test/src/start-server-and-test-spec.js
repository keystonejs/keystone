'use strict'

/* eslint-env mocha */
const startServerAndTest = require('.')
const la = require('lazy-ass')

function arrayEq (a, b) {
  return a.length === b.length && a.every((el, index) => el === b[index])
}

describe('start-server-and-test', () => {
  it('write this test', () => {
    console.assert(startServerAndTest, 'should export something')
  })
})

describe('utils', () => {
  const utils = require('./utils')

  context('isUrlOrPort', () => {
    const isUrlOrPort = utils.isUrlOrPort

    it('allows url', () => {
      la(isUrlOrPort('http://localhost'))
      la(isUrlOrPort('http://foo.com'))
      la(isUrlOrPort('http://foo.com/bar/baz.html'))
      la(isUrlOrPort('http://localhost:6000'))
    })

    it('allows port number or string', () => {
      la(isUrlOrPort('6006'))
      la(isUrlOrPort(8080))
    })

    it('allows :port string', () => {
      la(isUrlOrPort(':6006'))
    })

    it('allows multiple resources', () => {
      la(isUrlOrPort('http://localhost|http://foo.com'))
    })

    it('detects invalid resource when using multiple', () => {
      la(!isUrlOrPort('http://localhost|http://foo.com|_+9'))
    })
  })

  context('normalizeUrl', () => {
    const normalizeUrl = utils.normalizeUrl

    it('passes url', () => {
      la(arrayEq(normalizeUrl('http://localhost'), ['http://localhost']))
      la(
        arrayEq(normalizeUrl('http://localhost:6000'), [
          'http://localhost:6000'
        ])
      )
    })

    it('changes port to localhost', () => {
      la(arrayEq(normalizeUrl('6006'), ['http://localhost:6006']))
      la(arrayEq(normalizeUrl(8080), ['http://localhost:8080']))
    })

    it('changes :port to localhost', () => {
      la(arrayEq(normalizeUrl(':6006'), ['http://localhost:6006']))
    })

    it('returns original argument if does not know what to do', () => {
      la(arrayEq(normalizeUrl('foo'), ['foo']), normalizeUrl('foo'))
      la(arrayEq(normalizeUrl(808000), [808000]), normalizeUrl(808000))
    })

    it('parses multiple resources', () => {
      la(
        arrayEq(normalizeUrl(':6006|http://foo.com'), [
          'http://localhost:6006',
          'http://foo.com'
        ])
      )
    })
  })
})
