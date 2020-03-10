/* global it, describe */

import { expect } from 'chai'

const bed = require('../src')

describe('BED tests', function () {
  this.timeout(5000)

  it('discovery', async () => {
    let devList = await bed.discovery({type: '*'})
    expect(devList).to.be.an('array')
  })
})
