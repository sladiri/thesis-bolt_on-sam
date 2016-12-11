/* global EventSource */

import {logConsole} from '../shared/logger'
import h from 'hyperscript'
import {pony} from '../shared/pony'
import {onRender} from './render_dom'

const log = logConsole('client')
const sseLog = logConsole('client', 'SSE')

async function testFoo (ctx) {
  log('foo', `${JSON.stringify(await pony(200))}`)
}
testFoo()

const hello = (value) => {
  onRender({node: h('p', `Hello Sladi - ${value}`)})
}

hello()

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
