import {foo, pony as ponyFoo} from '../../shared/pony'
import {PassThrough} from 'stream'
import {pipe} from 'ramda'
import flyd from 'flyd'
import every from 'flyd/module/every'
import switchlatest from 'flyd/module/switchlatest'

function sseData (data) {
  return `data: ${data}\n\n`
}

export async function pony (ctx) {
  ctx.body = JSON.stringify(await ponyFoo(200), null, '  ')
}

export async function iso (ctx) {
  ctx.body = 'iso'
}

const close = (socket, stream) => what => msg => {
  stream.end(true)
  socket.removeListener(what, close)
  console.log('stream', what, msg)
}

const handleSseSocket = (socket, stream) => {
  const handler = close(socket, stream)
  socket.on('error', handler('error'))
  socket.on('close', handler('close'))
}

async function getPony (timeout, stream, id) {
  for await (const data of foo(timeout)) {
    stream(`${id} :: ${data}`)
  }
}

function getPonyFoo (timestamp) {
  const stream = flyd.stream()
  getPony(150, stream, timestamp)
  return stream
}

export async function sse (ctx) {
  const stream = new PassThrough()
  const ticker = pipe(
    flyd.map(getPonyFoo),
    switchlatest,
    flyd.map(sseData),
    flyd.on(::stream.write),
  )(every(1000))

  handleSseSocket(ctx.socket, ticker)

  ctx.type = 'text/event-stream'
  ctx.body = stream
}

export async function push (ctx) {
  ctx.body = 'push'
}
