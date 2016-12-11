/* global EventSource */

import {logConsole} from '../shared/logger'
import morphdom from 'morphdom'
import h from 'hyperscript'
import {equal} from 'assert'
import {isNil} from 'ramda'
import {pony} from '../shared/pony'

const log = logConsole('client')
const sseLog = logConsole('client', 'SSE')

async function testFoo (ctx) {
  log('foo', `${JSON.stringify(await pony(200))}`)
}
testFoo()

function renderDom (domNode) {
  equal(isNil(domNode), false)
  document.body.children.length === 0
    ? document.body.appendChild(domNode)
    : morphdom(document.body.firstChild, domNode)
}

const hello = (value) => {
  renderDom(h('p.count', `Hello Sladi - ${value}`))
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
