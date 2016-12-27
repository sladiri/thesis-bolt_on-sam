import {logConsole} from './logger'
import postal from 'postal/lib/postal.lodash'
import flyd from 'flyd'
import filter from 'flyd/module/filter'
import {prop, pipe, when} from 'ramda'

const logName = 'connect-postal'
const channel = 't_bo-sam'

function hasData (data) { return data !== undefined }

const subscribe = (stream, logTag) => {
  const subscribeLog = logConsole(logName, 'subscribe', logTag)
  return function subscribeHandler (topic) {
  subscribeLog('set source to topics', topic)
  flyd.on(function logBusToStreamHandler (message) {
    subscribeLog(topic, JSON.stringify({message}))
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
  const publishLog = logConsole(logName, 'postal-publish', logTag)
  targets.forEach(topic => {
    publishLog(targets, JSON.stringify(data))
    postal.publish({channel, topic, data})
  })
}

const unsubscribe = (topics, logTag, targets, subs) => function unsubscribeHandler (end) {
  logConsole(logName, 'unsubscribe', logTag)(topics, targets)
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
  const stream = pipe(
    flyd.map(prop('data')),
    flyd.map(when(validate, handler)),
  )(source)
  setSink({targets, stream, logTag})
  flyd.on(unsubscribe(topics, logTag, targets, subs), stream.end)
  return stream
}
