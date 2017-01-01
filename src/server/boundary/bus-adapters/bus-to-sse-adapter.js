import {logConsole} from '../../../shared/boundary/logger'
import validateAndLog from '../../../shared/boundary/json-schema'
import {PassThrough} from 'stream'
import flyd from 'flyd'
import {pipe, when, dissocPath, allPass} from 'ramda'
import {getSource} from '../../../shared/boundary/connect-postal'

const logName = 'bus-to-sse-adapter'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['data', 'envelope'],
  properties: {
    data: {
      required: ['meta'],
      properties: {
        meta: {
          properties: {
            sessionId: {type: 'number'},
          },
        },
        KA: {type: 'boolean'},
      },
    },
  },
}, log)

const filterById = session => message => session.id === message.data.meta.sessionId
const sanitiseMessage = message => dissocPath(['data', 'meta'], message)
const busToSseData = message => `data: ${JSON.stringify(message)}\n\n`

const aliveMessage = () => `data: ${JSON.stringify({KA: true})}\n\n`

const onClose = (socket, stream, keepAlive, what) => {
  function onCloseHandler (message) {
    clearInterval(keepAlive)
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
      when(
        allPass([validate, filterById(ctx.session)]),
        pipe(
          sanitiseMessage,
          busToSseData,
          ::socketStream.write,
        )),
      source)

    const keepAlive = setInterval(pipe(aliveMessage, ::socketStream.write), 1000 * 60)

    socket.on('error', onClose(socket, stream, keepAlive, 'error'))
    socket.on('close', onClose(socket, stream, keepAlive, 'close'))

    ctx.type = 'text/event-stream'
    ctx.body = socketStream
  }
}
