import {logConsole} from '../../../shared/boundary/logger'
import validateAndLog from '../../../shared/boundary/json-schema'
import {PassThrough} from 'stream'
import {pipe, assocPath, path, when, prop} from 'ramda'
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

const getBroadcast = path(['meta', 'broadcast'])
const getToken = path(['token'])
const getTokenStreamID = pipe(getToken, path(['streamID']))

const saveTokenByID = (streams, id) => message => {
  if (getTokenStreamID(message) === id) {
    streams[id] = getToken(message)
  }
  return message
}

const restoreTokenByID = (streams, id) => message => {
  return assocPath(['token'], streams[id], message)
}

const filterByID = id => message => {
  console.log('fil', id, getTokenStreamID(message), getBroadcast(message))
  return getTokenStreamID(message) === id || getBroadcast(message)
}

const signToken = message => {
  const messageToken = getToken(message)
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

const streams = {}

export default topics => {
  return async function busToSseAdapter (ctx) {
    let token
    try {
      token = jwt.verify(path(['session', 'clientInitToken'], ctx), 'secret')
    } catch ({message}) {
      log(message)
      ctx.status = 403
      ctx.body = {message: 'Invalid token.'}
      return
    }
    const {clientInitID} = token
    if (!clientInitID) {
      const message = 'Missing clientInitID.'
      log(message)
      ctx.status = 403
      ctx.body = {message}
      return
    }
    streams[clientInitID] = token
    console.log(`added stream [id=${clientInitID}] - ${Object.keys(streams).length} streams active`)

    const socketStream = new PassThrough()

    const {postalSubs, source} = getSource({topics, logTag: logName})
    const streamSub = source
      ::map(when(path(['envelope']), prop('data')))
      ::_do(saveTokenByID(streams, clientInitID))
      ::filter(filterByID(clientInitID))
      ::map(when(getBroadcast, restoreTokenByID(streams, clientInitID)))
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
          socket.on('error', () => { log(`already socket closed for stream [id=${clientInitID}]`) })
        }
        clearInterval(keepalive)
        postalSubs.forEach(sub => { sub.unsubscribe() })
        streamSub.unsubscribe()
        socket.removeListener(what, onCloseHandler)
        streams[clientInitID] = undefined
        delete streams[clientInitID]
        console.log(`removed stream [id=${clientInitID}] - ${Object.keys(streams).length} streams active`)
        log(`socket closed for stream [id=${clientInitID}]`, what, message)
      }
    }
    socket.on('error', onClose('error'))
    socket.on('close', onClose('close'))

    ctx.type = 'text/event-stream'
    ctx.body = socketStream
  }
}
