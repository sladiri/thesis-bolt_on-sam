import {logConsole} from '../../../shared/boundary/logger'
import validateAndLog from '../../../shared/boundary/json-schema'
import {PassThrough} from 'stream'
import {pipe, assocPath, path, when, prop, isNil} from 'ramda'
import {getSource, busChannel} from '../../../shared/boundary/connect-postal'
import jwt from 'jsonwebtoken'
import {state} from '../../../shared/control/state'
import {map} from 'rxjs/operator/map'
import {filter} from 'rxjs/operator/filter'
import {_do} from 'rxjs/operator/do'
import {_catch} from 'rxjs/operator/catch'

const logName = 'bus-to-sse-adapter'
const log = logConsole(logName)

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

const getToken = path(['token'])

const filterSession = ctx => message => {
  return ctx.session.streamID === message.token.streamID
}

const setSession = ctx => message => {
  console.log('set session 1', ctx.session.streamID, message.token.streamID)
  if (!ctx.session.streamID) {
    ctx.session.streamID = message.token.streamID
  }
  console.log('set session 2', ctx.session.streamID, message.token.streamID)
  return message
}

const signToken = message => {
  const messageToken = getToken(message)
  console.log('sign signed?', !!messageToken.exp)
  const token = messageToken
    ? messageToken.exp
      ? jwt.sign(messageToken, 'secret')
      : jwt.sign(messageToken, 'secret', {expiresIn: '2h'})
    : undefined

  return assocPath(['token'], token, message)
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

const busToSseData = message => `data: ${JSON.stringify(message)}\n\n`

export default topics => {
  return async function busToSseAdapter (ctx) {
    console.log('b2s first session', ctx.session.streamID)
    // debugger
    const socketStream = new PassThrough()

    const {postalSubs, source} = getSource({topics, logTag: logName})
    const streamSub = source
      ::map(when(path(['envelope']), prop('data')))
      ::filter(pipe(prop('init'), isNil))
      ::map(setSession(ctx))
      ::filter(filterSession(ctx))
      ::map(state)
      ::map(signToken)
      ::map(fakePostalMessage)
      ::filter(validate)
      ::map(busToSseData)
      ::_catch(error => { console.log('bus2sse error', logName, error); debugger })
      .subscribe(::socketStream.write)

    const {socket} = ctx
    const keepaliveInterval = 1000 * 60 * 5
    const keepalive = setInterval(pipe(
        () => `data: ${JSON.stringify({KA: true})}\n\n`,
        ::socketStream.write,
      ), keepaliveInterval)
    socket.setTimeout(keepaliveInterval * 2)
    ctx.res.socket.setTimeout(keepaliveInterval * 2)
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
  }
}
