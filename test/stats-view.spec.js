/* global Request, self */
/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const clearModule = require('clear-module')
const makeServiceWorkerEnv = require('service-worker-mock')
global.window = require('./helpers/mock-window')()

const checkAll = (bits) => string => bits.every(bit => string.includes(bit))
const checkAny = (bits) => string => bits.some(bit => string.includes(bit))

describe('Stats view page', function () {
  beforeEach(() => {
    Object.assign(
      global,
      makeServiceWorkerEnv()
    )
    clearModule('../src')
  })

  it('should return the stats page with the fetched hashes correctly', () => {
    require('../src')

    return Promise.all([self.trigger('fetch', new Request(`/ipfs/QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o`)),
      self.trigger('fetch', new Request(`/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`)),
      self.trigger('fetch', new Request(`/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/about`))])
      .then((values) => {
        expect(values).to.exist()
        return self.trigger('fetch', new Request(`/ipfs/stats`))
          .then((response) => {
            expect(response).to.exist()
            expect(response.headers).to.exist()
            expect(response.body).to.exist()
            expect(response.body).to.satisfy(checkAll([
              'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
              'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
              'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/about'
            ]))
          })
          .catch(() => {
            expect(values).to.not.exist()
          })
      })
  })

  it('should return the stats page with empty fetched hashes correctly', () => {
    require('../src')

    return self.trigger('fetch', new Request(`/ipfs/stats`))
      .then((response) => {
        expect(response).to.exist()
        expect(response.headers).to.exist()
        expect(response.body).to.exist()
        expect(response.body).to.not.satisfy(checkAny([
          'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
          'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
          'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/about'
        ]))
        expect(response.body).to.satisfy(checkAll([
          'Any CID fetched so far'
        ]))
      })
  })
})
