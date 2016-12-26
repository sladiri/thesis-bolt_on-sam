import {logConsole} from '../../shared/boundary/logger'
import {PassThrough} from 'stream'
import flyd from 'flyd'
import {pipe} from 'ramda'
import {getSource} from '../../shared/boundary/connect-postal'

const log = logConsole('bus-to-sse-adapter')

function busToSseData (message) {
  const data = `data: ${JSON.stringify(message)}\n\n`
  log('map data', JSON.stringify(data))
  return data
}

const onClose = (socket, subs, stream, what) => {
  function onCloseHandler (message) {
    subs.forEach((sub) => { sub.unsubscribe() })
    stream.end(true)
    socket.removeListener(what, onCloseHandler)
    log('socket closed', what, message)
  }
  return onCloseHandler
}

export default async function busToSseAdapter (ctx) {
  const {socket} = ctx
  const socketStream = new PassThrough()

  const {subs, source} = getSource({topics: ['*']})

  pipe(
    flyd.map(busToSseData),
    flyd.on(::socketStream.write),
  )(source)

  socket.on('error', onClose(socket, subs, source, 'error'))
  socket.on('close', onClose(socket, subs, source, 'close'))

  ctx.type = 'text/event-stream'
  ctx.body = socketStream
}
