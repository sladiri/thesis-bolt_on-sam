import {logConsole} from '../../../shared/boundary/logger'
import validateAndLog from '../../../shared/boundary/json-schema'
import {PassThrough} from 'stream'
import {pipe, assocPath, path, when, isNil, not, equals, pickAll} from 'ramda'
import {getSource, busChannel, getSink} from '../../../shared/boundary/connect-postal'
import jwt from 'jsonwebtoken'
import {state} from '../../../shared/control/state'
import {map} from 'rxjs/operator/map'
import {filter} from 'rxjs/operator/filter'
import {_do} from 'rxjs/operator/do'
import {_catch} from 'rxjs/operator/catch'

const logName = 'bus-to-sse-adapter'
const log = logConsole(logName)
const clientErrorLog = logConsole(logName, 'client-error')

export const validate = validateAndLog({
  required: ['data', 'envelope'],
  properties: {
    data: {
      required: ['token'],
    },
    envelope: {
      required: ['channel', 'topic', 'timeStamp', 'data'],
    },
  },
}, log)

const sessionID = path(['streamID'])
const token = path(['token'])
const tokenID = pipe(token, path(['data', 'streamID']))
const broadcasterID = path(['broadcasterID'])

const signToken = message => {
  const signed = jwt.sign(token(message), 'secret')
  return assocPath(['token'], signed, message)
}

const fakePostalMessage = data => {
  return {
    data,
    envelope: {
      data,
      channel: busChannel,
      topic: 'stateRepresentation',
      timeStamp: (new Date()).toISOString(),
    },
  }
}

const isBroadcast = ({mutation}) =>
  [
    'increment',
    'postMessage',
  ].includes(mutation)
const actionSink = getSink({targets: ['actions'], logTag: logName})
const broadcastAction = message => {
  setTimeout(() => {
    actionSink({
      action: 'broadcast',
      token: jwt.sign(message.token, 'secret'),
      actionToken: message.actionToken,
    })
  }, 0)
}

let msgID = 1001
export default topics => {
  return async function busToSseAdapter (ctx) {
    const session = {}

    try {
      const {data: {streamID}} = jwt.verify(ctx.session.serverInitToken, 'secret')
      delete ctx.session.serverInitToken
      session.streamID = streamID
      log('SSE connect', streamID)
    } catch ({message}) {
      clientErrorLog(message)
      ctx.status = 403
      return
    }

    try {
      const socketStream = new PassThrough()
      const {postalSubs, source} = getSource({topics, logTag: logName})

      const streamSub = source
        ::map(assocPath(['data', 'msgID'], msgID++))
        ::map(path(['data']))
        ::filter(pipe(path(['init']), equals('server'), not))
        ::filter(message => sessionID(session) !== broadcasterID(message))
        ::map(when(broadcasterID, message => ({...message, token: token(session)})))
        ::filter(message => sessionID(session) === tokenID(message) || broadcasterID(message))
        ::map(state)
        ::_do(message => { session.token = token(message) })
        ::_do(pipe(
          pickAll(['error', 'token', 'actionToken', 'view', 'stuff']),
          signToken,
          fakePostalMessage,
          when(validate, pipe(
            message => `data: ${JSON.stringify(message)}\n\n`,
            ::socketStream.write,
          )),
        ))
        ::_do(when(isBroadcast, broadcastAction))
        ::_catch(error => { console.error('bus2sse error', logName, error) })
        .subscribe()

      const {socket} = ctx
      const keepaliveInterval = 1000 * 60 * 1

      const keepalive = setInterval(
        pipe(() => `data: ${JSON.stringify({KA: true})}\n\n`, ::socketStream.write),
        keepaliveInterval)

      // TODO increase socket timeout
      // socket.setTimeout(keepaliveInterval * 2)
      // ctx.res.socket.setTimeout(keepaliveInterval * 2)

      const onClose = what => {
        return function onCloseHandler (message) {
          if (what === 'close') {
            socket.removeAllListeners('error')
            socket.on('error', () => { log('already socket closed') })
          }
          clearInterval(keepalive)
          postalSubs.forEach(sub => { sub.unsubscribe() })
          streamSub.unsubscribe()
          socket.removeListener(what, onCloseHandler)
          log('socket closed', what, message)
        }
      }

      socket.on('error', onClose('error'))
      socket.on('close', onClose('close'))

      ctx.type = 'text/event-stream'
      ctx.body = socketStream
    } catch (error) {
      log(error)
      ctx.status = 500
    }
  }
}
