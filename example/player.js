const bed = require('../src')
const debug = require('debug')('bed')

const playerAddr = '192.168.1.4'
const decoderAddr = '192.168.1.161'

bed.hostIp('192.168.1.87')

let dev

(async () => {
  dev = await bed.create({address: playerAddr, timeout: 21 * 1000})
  console.log(await dev.exec('txInfo'))
})()

async function loop () {
  const dev = await bed.create({address: playerAddr, timeout: 21 * 1000})

  await dev.exec('mount', {id: 'icp', pw: 'icp', src: '//192.168.1.101/icp'})
  await dev.exec('play', {file: '//192.168.1.101/piano2.wav', type: 'audio', vol: 90})
  dev.on('event', e => {
    if (e.name === 'stopped') {
      dev.exec('play', {file: '//192.168.1.101/piano2.wav', type: 'audio', vol: 90})
    }
  })
}

async function test () {
  const dev = await bed.create({address: playerAddr, timeout: 21 * 1000})
  const decoder = await bed.create({address: decoderAddr, timeout: 21 * 1000})

  await decoder.exec('connectChannel', {channel: 1})

  console.log(await dev.exec('info', {level: 1}))
  console.log(await dev.exec('setMac', {mac: '112233'}))
  console.log(await dev.exec('mount', {id: 'icp', pw: 'icp', src: '//192.168.1.101/icp'}))

  console.log(await dev.exec('getVolume'))
  console.log(await dev.exec('setChannel', {channel: 10}))
  console.log(await dev.exec('info', {level: 1}))

  console.log(await dev.exec('play', {file: '//192.168.1.101/bbb_sunflower_1080p_30fps_normal.mp4', type: 'video', loop: false}))

  await sleep(5000)

  console.log(await dev.exec('play', {file: '//192.168.1.101/piano2.wav', type: 'audio'}))
  await sleep(2000)
  console.log(await dev.exec('play', {file: '//192.168.1.101/piano2.wav', type: 'audio', vol: 30}))
  await sleep(2000)
  console.log(await dev.exec('play', {file: '//192.168.1.101/piano2.wav', type: 'audio', vol: 80}))
  await sleep(2000)
  console.log(await dev.exec('position', {position: 20}))
  await sleep(2000)
  console.log(await dev.exec('stop'))

  dev.on('event', data => {
    console.log(`on event: `, data)
  })
}

async function sleep (time) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve()
    }, time)
  })
}
