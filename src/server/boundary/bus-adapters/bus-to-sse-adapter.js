import {logConsole} from '../../../shared/boundary/logger'
import validateAndLog from '../../../shared/boundary/json-schema'
import {PassThrough} from 'stream'
import flyd from 'flyd'
import {pipe, assocPath, path, when, prop} from 'ramda'
import {getSource, busChannel} from '../../../shared/boundary/connect-postal'
import jwt from 'jsonwebtoken'
import {state} from '../../../shared/control/state'

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
    streams[id].token = getToken(message)
  }
  return message
}

const restoreTokenByID = saved => message => {
  return assocPath(['token'], saved.token, message)
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
  const {source} = getSource({topics, logTag: logName})

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
    streams[clientInitID] = {}

    const socketStream = new PassThrough()
    streams[clientInitID].socketStream = socketStream

    // const stream = pipe(
    //   flyd.map(addSseID(streamID)),
    //   filter(allPass([validate, filterSseID(streamID)])),
    //   flyd.map(sanitise),
    //   flyd.map(busToSseData),
    //   flyd.on(::socketStream.write)
    // )(source)

    const stream = flyd.on(
      pipe(
        when(path(['envelope']), prop('data')),
        saveTokenByID(streams, clientInitID),
        when(
          filterByID(clientInitID),
          pipe(
            when(getBroadcast, restoreTokenByID(streams[clientInitID])),
            state,
            signToken,
            fakePostalMessage,
            when(validate, pipe(busToSseData, ::socketStream.write)),
          )
        ),
      ),
      source)
    streams[clientInitID].stream = stream

    console.log(`added stream [id=${clientInitID}] - ${Object.keys(streams).length} streams active`)

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
        stream.end(true)
        clearInterval(keepalive)
        socket.removeListener(what, onCloseHandler)
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
