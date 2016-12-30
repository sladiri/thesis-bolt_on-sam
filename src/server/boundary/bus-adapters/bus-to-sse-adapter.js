import {logConsole} from '../../../shared/boundary/logger'
import {PassThrough} from 'stream'
import flyd from 'flyd'
import {pipe, when} from 'ramda'
import {getSource} from '../../../shared/boundary/connect-postal'

const logName = 'bus-to-sse-adapter'
const log = logConsole(logName)

const filterById = session => function filterByIdHandler (message) {
  return session.id === message.data.meta.sessionId
}

function busToSseData (message) {
  return `data: ${JSON.stringify(message)}\n\n`
}

const onClose = (socket, stream, what) => {
  function onCloseHandler (message) {
    stream.end(true)
    socket.removeListener(what, onCloseHandler)
    log('socket closed', what, message)
  }
  return onCloseHandler
}

export default topics => {
  const {source} = getSource({topics, logTag: logName})

  return async function busToSseAdapter (ctx) {
    if (!ctx.session.id) {
      ctx.status = 401
      ctx.body = 'No session found.'
      return
    }

    const {socket} = ctx
    const socketStream = new PassThrough()

    const stream = flyd.on(
      when(filterById(ctx.session), pipe(busToSseData, ::socketStream.write)),
      source)

    socket.on('error', onClose(socket, stream, 'error'))
    socket.on('close', onClose(socket, stream, 'close'))

    ctx.type = 'text/event-stream'
    ctx.body = socketStream
  }
}
