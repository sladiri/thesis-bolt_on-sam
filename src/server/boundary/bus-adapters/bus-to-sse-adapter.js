import {logConsole} from '../../../shared/boundary/logger'
import validateAndLog from '../../../shared/boundary/json-schema'
import {PassThrough} from 'stream'
import {pipe, assocPath, path, when, prop, isNil, __, not, compose} from 'ramda'
import {getSource, busChannel} from '../../../shared/boundary/connect-postal'
import jwt from 'jsonwebtoken'
import {state} from '../../../shared/control/state'
import {map} from 'rxjs/operator/map'
import {filter} from 'rxjs/operator/filter'
import {_do} from 'rxjs/operator/do'
import {_catch} from 'rxjs/operator/catch'
import {mergeMap} from 'rxjs/operator/mergeMap'

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

const broadcastStreams = (ctx, streams) => message => {
  const isExpired = path(['meta', 'expiredToken'], message)
  const isBroadcast = path(['isBroadcast'], message)
  const streamID = path(['session', 'streamID'], ctx)
  const broadcasterID = path(['token', 'streamID'], message)
  const tobeBroadcast = path(['meta', 'tobeBroadcast'], message)

  const rrrrr = isBroadcast
    ? Object.values(streams)
      .filter(({streamID}) => streamID !== broadcasterID)
      .map(assocPath(['token'], __, message))
      .map(assocPath(['wasBroadcast'], true))
      // .concat(message)
    : [message]
    // : isExpired
    //   ? []
    //   : [message]

  // if (isBroadcast) { debugger }
  // if (isExpired) { debugger }
  console.log('broadc', rrrrr.length, tobeBroadcast, isBroadcast, isExpired, broadcasterID, streamID)
  return rrrrr
}

const filterByID = ctx => message => {
  console.log(ctx.session.streamID, message.token.streamID, message.token, message.meta)
  return ctx.session.streamID === message.token.streamID ||
    (ctx.session.streamID !== message.token.streamID &&
    path(['meta', 'tobeBroadcast'], message) && !path(['wasBroadcast']))
}

const resetBroadcastStreamID = ctx => message => {
  if (ctx.session.streamID &&
    ctx.session.streamID !== message.token.streamID && path(['isBroadcast'], message)) {
    message.token.streamID = ctx.session.streamID
  }
  return message
}

const saveStreamIdToSession = ctx => message => {
  if (!ctx.session.streamID) {
    ctx.session.streamID = message.token.streamID
  }
  return message
}

const saveTokenByStreamID = streams => message => {
  streams[message.token.streamID] = message.token
}

const signToken = message => {
  const messageToken = getToken(message)
  const token = jwt.sign(messageToken, 'secret')
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
  const streams = {}

  return async function busToSseAdapter (ctx) {
    const socketStream = new PassThrough()

    const {postalSubs, source} = getSource({topics, logTag: logName})
    const streamSub = source
      ::map(when(path(['envelope']), prop('data')))
      ::filter(pipe(prop('init'), isNil))
      ::map(saveStreamIdToSession(ctx))
      ::_do(saveTokenByStreamID(streams))
      ::mergeMap(broadcastStreams(ctx, streams))
      ::filter(filterByID(ctx))
      ::map(resetBroadcastStreamID(ctx))
      ::map(state)
      ::filter(compose(not, isNil))
      ::_do(x => console.log('to sennnnnnnnd', x.token.streamID))
      ::map(signToken)
      ::map(fakePostalMessage)
      ::filter(validate)
      ::map(busToSseData)
      ::_do(::socketStream.write)
      ::_catch(error => { console.log('bus2sse error', logName, error); debugger })
      .subscribe()

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
