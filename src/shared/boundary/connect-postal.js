import {logConsole} from './logger'
import postal from 'postal/lib/postal.lodash'
import flyd from 'flyd'
import filter from 'flyd/module/filter'
import {prop, pipe} from 'ramda'

const log = logConsole('connect')
const publishLog = logConsole('connect', 'postal-publish')
const subscribeLog = logConsole('connect', 'postal-subscribe')

const channel = 't_bo-sam'

function hasData (data) { return data !== undefined }
const busToStream = stream => function busToStreamHandler (data, envelope) {
  stream({data, envelope})
}
const logBusToStream = topics => function logBusToStreamHandler (message) {
  subscribeLog(topics, JSON.stringify({message}))
}
const subscribe = (topics, stream) => function subscribeHandler (topic) {
  subscribeLog('set source to topics', topics)
  flyd.on(logBusToStream(topics), stream)
  return postal.subscribe({
    channel,
    topic,
    callback: busToStream(stream),
  })
}
const publishToBus = targets => function publishToBusHandler (data) {
  targets.forEach(topic => {
    publishLog(targets, JSON.stringify(data))
    postal.publish({channel, topic, data})
  })
}
const unsubscribe = (topics, targets, subs) => function unsubscribeHandler (end) {
  log('unsubscribe', topics, targets)
  subs.forEach(sub => { sub.unsubscribe() })
}

export function getSource ({topics}) {
  const stream = filter(hasData, flyd.stream())
  const subs = topics.map(subscribe(topics, stream))
  return {subs, source: stream}
}

export function setSink ({stream, targets = []}) {
  stream = filter(hasData, stream)
  flyd.on(publishToBus(targets), stream)
  return stream
}

export function getSink ({targets}) {
  return setSink({stream: flyd.stream(), targets})
}

export function connect ({topics, validate, handler, targets = []}) {
  const {subs, source} = getSource({topics})
  const stream = pipe(
    flyd.map(prop('data')),
    flyd.map(handler)
  )(source)
  const link = setSink({stream, targets})
  flyd.on(unsubscribe(topics, targets, subs), link.end)
  return link
}
