import {logConsole} from './logger'
import postal from 'postal/lib/postal.lodash'
import flyd from 'flyd'
import filter from 'flyd/module/filter'
import {prop, pipe, when} from 'ramda'

const log = logConsole('connect')
const publishLog = logConsole('connect', 'postal-publish')
const subscribeLog = logConsole('connect', 'postal-subscribe')

const channel = 't_bo-sam'

function hasData (data) { return data !== undefined }

const subscribe = stream => function subscribeHandler (topic) {
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

const publish = targets => function publishHandler (data) {
  targets.forEach(topic => {
    publishLog(targets, JSON.stringify(data))
    postal.publish({channel, topic, data})
  })
}

const unsubscribe = (topics, targets, subs) => function unsubscribeHandler (end) {
  log('unsubscribe', topics, targets)
  subs.forEach(sub => { sub.unsubscribe() })
}

const setSink = ({targets, stream}) => {
  stream = filter(hasData, stream)
  flyd.on(publish(targets), stream)
}

export function getSource ({topics}) {
  const stream = filter(hasData, flyd.stream())
  const subs = topics.map(subscribe(stream))
  return {subs, source: stream}
}

export function getSink ({targets}) {
  const stream = flyd.stream()
  setSink({targets, stream})
  return stream
}

export function connect ({topics, validate, handler, targets = []}) {
  const {subs, source} = getSource({topics})
  const stream = pipe(
    flyd.map(prop('data')),
    flyd.map(when(validate, handler)),
  )(source)
  setSink({targets, stream})
  flyd.on(unsubscribe(topics, targets, subs), stream.end)
  return stream
}
