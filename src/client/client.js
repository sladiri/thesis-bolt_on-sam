/* global EventSource */

import {logConsole} from '../shared/logger'
import {pony} from '../shared/pony'
const log = logConsole('client')
const sseLog = logConsole('client', 'SSE')

async function testFoo (ctx) {
  log('foo', `${JSON.stringify(await pony(200))}`)
}
testFoo()

async function test (ctx) {
  const foo = `foo: ${JSON.stringify(await pony(200))}`
  console.log(foo)
}
test()

const hello = 'hello client'
console.log(hello)
document.body.innerHTML = hello

const source = new EventSource('/test/sse')
source.addEventListener('message', function (e) {
  hello(e.data)
}, false)

source.addEventListener('open', function (e) {
  sseLog('sse opened')
}, false)

source.addEventListener('error', function (e) {
  if (e.readyState === EventSource.CLOSED) {
    sseLog('sse closed', e)
  }
  sseLog('sse error', e)
}, false)
