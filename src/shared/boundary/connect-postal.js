import {logConsole} from './logger'
import postal from 'postal/lib/postal.lodash'
import flyd from 'flyd'
import filter from 'flyd/module/filter'
import {prop, pipe, when, head} from 'ramda'
import validateAndLog from './json-schema'

const channel = 't_bo-sam'

const logName = 'connect-postal'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['envelope', 'data'],
  properties: {
    envelope: {
      required: ['channel', 'data', 'timeStamp', 'topic'],
      properties: {
        channel: {type: 'string'},
        timeStamp: {type: 'string'},
        topic: {type: 'string'},
      },
    },
  },
}, log)

function hasData (data) { return data !== undefined }

const subscribe = (stream, logTag) => {
  const subscribeLog = logConsole(logName, logTag)
  return function subscribeHandler (topic) {
    subscribeLog('subscription set source to topics', topic)
    flyd.on(function logBusToStreamHandler (message) {
      subscribeLog('subscription got message', topic, JSON.stringify({message}))
    }, stream)

    return postal.subscribe({
      channel,
      topic,
      callback: function busToStreamHandler (data, envelope) {
        stream({data, envelope})
      },
    })
  }
}

const publish = (targets, logTag) => function publishHandler (data) {
  const publishLog = logConsole(logName, logTag)
  publishLog('about to publish data to targets', targets)
  targets.forEach(topic => {
    publishLog('publishing data to target', topic, JSON.stringify(data))
    postal.publish({channel, topic, data})
  })
}

const unsubscribe = (topics, logTag, targets, subs) => function unsubscribeHandler (end) {
  logConsole(logName, logTag)('unsubscribing', topics, targets)
  subs.forEach(sub => { sub.unsubscribe() })
}

const setSink = ({targets, stream, logTag}) => {
  stream = filter(hasData, stream)
  flyd.on(publish(targets, logTag), stream)
}

export function getSource ({topics, logTag}) {
  const stream = filter(hasData, flyd.stream())
  const subs = topics.map(subscribe(stream, logTag))
  return {subs, source: stream}
}

export function getSink ({targets, logTag}) {
  const stream = flyd.stream()
  setSink({targets, logTag, stream})
  return stream
}

export function connect ({topics, logTag, validate, handler, targets = []}) {
  const {subs, source} = getSource({topics, logTag})
  const stream = flyd.map(pipe(prop('data'), when(pipe(validate, head), handler)), source)
  setSink({targets, stream, logTag})
  flyd.on(unsubscribe(topics, logTag, targets, subs), stream.end)
  return stream
}

export function toBusAdapter ({sinks, logTag}) {
  const adapterLog = logConsole(logName, 'toBusAdapter', logTag)
  return function messageHandler (data) {
    const payload = JSON.parse(data)

    const [ok, message] = validate(payload)
    if (!ok) {
      adapterLog('invalid data schema', data)
      throw new Error(JSON.stringify(message))
    }

    const target = payload.envelope.topic
    const sink = sinks[target] = sinks[target] || getSink({targets: [target], logTag})
    sink(payload.data)
  }
}
