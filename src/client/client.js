/* global EventSource */

import {pony} from '../shared/pony'

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
  document.body.innerHTML = e.data
}, false)

source.addEventListener('open', function (e) {
  console.log('sse opened')
}, false)

source.addEventListener('error', function (e) {
  if (e.readyState === EventSource.CLOSED) {
    console.log('sse closed', e)
  }
  console.log('sse error', e)
}, false)
