import {logConsole} from '../../../shared/boundary/logger'
import {PassThrough} from 'stream'
import flyd from 'flyd'
import {pipe} from 'ramda'
import {getSource} from '../../../shared/boundary/connect-postal'

const logName = 'bus-to-sse-adapter'
const log = logConsole(logName)

function busToSseData (message) {
  const data = `data: ${JSON.stringify(message)}\n\n`
  log('map bus data', data)
  return data
}

export default topics => {
  const {source} = getSource({topics, logTag: logName})

  const onClose = (socket, stream, what) => {
    function onCloseHandler (message) {
      stream.end(true)
      socket.removeListener(what, onCloseHandler)
      log('socket closed', what, message)
    }
    return onCloseHandler
  }

  return async function busToSseAdapter (ctx) {
    const {socket} = ctx
    const socketStream = new PassThrough()

    const stream = flyd.on(pipe(busToSseData, ::socketStream.write), source)

    socket.on('error', onClose(socket, stream, 'error'))
    socket.on('close', onClose(socket, stream, 'close'))

    ctx.type = 'text/event-stream'
    ctx.body = socketStream
  }
}
