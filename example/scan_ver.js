#!/usr/bin/env node

// DESC: 列出線上 icp5111 版本

const bed = require('../src')
const os = require('os')

const eth = process.argv[2] || 'eth0'
let hostIp

try {
  hostIp = os.networkInterfaces()[eth].find(ele => ele.family === 'IPv4').address
} catch (e) {
  console.log(`ERROR: bind on ${eth} faild`)
  process.exit()
}

bed.hostIp(hostIp);

(async () => {
  console.log(`Start scaning on card ${eth} ...\n`)
  await scan()
  console.log(`Scan complete`)
  process.exit()
})()

async function scan () {
  const devList = await bed.discovery({type: 'icp5111'})

  for (let info of devList) {
    const dev = await bed.create({address: info.address, timeout: 5 * 1000})
    console.log(await dev.exec('ver'))
  }
}
