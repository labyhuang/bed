# BED (BXXXXX Embedded Device Protocol)
Library for BXXXXX embedded devices

## BED API

### hostIp(ip)
有多張網卡的話需指定要使用的介面，只有一張的話會自動使用該網路介面．
建議還是手動指定比較保險．

**`ip`** (optional, string, default: auto detect) 要使用的網路介面 ip 位址

```javascript
bed.hostIp('192.168.1.45')
```

### discovery(type)

搜尋網路上的裝置

**`type`** (optional, string, default: '*') 要搜尋的裝置型號，例如 mt2、hdd750，預設找出全部裝置．

```javascript
const bed = require('@bxxxxx/bed')

(async () => {
  const devList = await bed.discovery()
  console.log(devList)
})()
```

### create(opts)
建立裝置 instance，之後可由此控制裝置

**`address`** (required, string) 裝置 ip，可由 discovery 後取得．
**`timeout`** (optional, int) 預設 10000ms．命令執行超過時會 TIMEOUT error，某些長時間執行命令 (例如 relay 測試、update fw) 可增加此值．

```javascript
const dev = await bed.create({address: '192.168.1.223', timeout: '10000'})
```

注意，建立時可能會遇到 TIMEOUT exception 要處理 (該裝置沒回應，連不上)．底層部分在 timeout 前會每 1000ms 重連一次，所以也可以把傳入的 timeout 值設定很長，讓它一直 try 到連上為止．

### exec(cmd, args, ids)
執行 multicast 命令，回傳該 cmd sn 以用來追蹤執行狀態．

**`cmd`** (required, string) 命令名稱．
**`args`** (required, object) 命令參數．args 中有包含 host 的話，device 會將執行結果回覆到該 host．
**`ids`** (optional, string, default '*') 執行命令的裝置 device id list，逗號分格．預設全部裝置會執行．

### event

**`message`** 收到 message

```javascript
const bed = require('@bxxxxx/bed')
const hostIp = '192.168.1.49'

let ids = []

for (let i = 0; i < 1024; i++) {
  const id = Math.floor(Math.random() * 16777215).toString(16)
  ids.push(id)
}

// add target device id to ids list
ids.push('aabbccddeeff')
ids = ids.join(',')

bed.on('message', msg => {
  // 要自己追蹤命令執行狀況
  console.log(msg)
})

const cmdSn = bed.exec('info', {level: '0', host: hostIp, tpye: 'hdd750'}, ids)
console.log(cmdSn)
```


## Device API

### exec(cmd, args)
執行裝置上的指令

**`cmd`** (required, string) 命令名稱．
**`args`** (optional, object) 命令參數．

```javascript
// 連線到 mt2
const mt2 = await bed.create({address: '192.168.1.115'})
// 取得裝置資訊
console.log(await mt2.exec('info'))
// 設定 sn
await mt2.exec('sn', {data: 'mt2_test_sn_12345'})
// 重新啟動服務
await mt2.exec('restart',{data: 'service'})
// 再次取得裝置資訊，因重啟服務需要時間，等三秒後再問．因底層會自動重連，所以不用再連線．
setTimeout(async () => {
  console.log(await mt2.exec('info'))
}, 3000)
```

```javascript
// 連線到 HDD-750
const monitor = await bed.create({address: '192.168.1.218'})
// 影像切換到 ip cam
await monitor.exec('connectStream', {uri: 'rtsp://192.168.1.225:8557/h264'})
```

### event
**`connect`** 已建立連線

**`close`** 已失去連線

**`event`** 收到 device event 事件

```javascript
  const dev = await bed.create({address: '169.254.0.20', timeout: 20 * 1000})

  dev.on('connect', data => {
    console.log(`device connected`)
  })

  dev.on('close', data => {
    console.log(`device closed`)
  })

  dev.on('event', data => {
    console.log(`on event: `, data)
  })  
}
```

## Examples

在 mt2 ioTest 時定時詢問狀態，測試完後離開

```javascript
async function main () {
  const dev = await bed.create({address: '192.168.1.223', timeout: 20 * 1000})

  dev.exec('ioTest').then(res => {
    console.log(res)
    process.exit()
  })

  setInterval(async() => {
    let info = await dev.exec('info')
    console.log(info)
  }, 1500)
}
```

在 mt2 ioTest 時監聽狀態狀態，測試完後離開

```javascript
async function main () {
  const dev = await bed.create({address: '192.168.1.223', timeout: 20 * 1000})

  dev.on('event', data => {
    console.log(`on event: `, data)
  })

  console.log(await dev.exec('ioTest'))

  process.exit()

}
```

```
on event:  { name: 'status', cnt: '1' }
on event:  { name: 'status', cnt: '2' }
on event:  { name: 'status', cnt: '3' }
... 略
on event:  { name: 'status', cnt: '16' }
exec result:  { rs232: 'false', relay: 'false' }
```
