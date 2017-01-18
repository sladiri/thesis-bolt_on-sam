import {logConsole} from './logger'
import postal from 'postal/lib/postal.lodash'
import {Subject} from 'rxjs/Subject'
import {map} from 'rxjs/operator/map'
import {filter} from 'rxjs/operator/filter'
import {_do} from 'rxjs/operator/do'
import {_catch} from 'rxjs/operator/catch'
import {prop, when, pipe, head} from 'ramda'
import validateAndLog from './json-schema'

export const busChannel = 't_bo-sam'

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

const subscribe = ({sink, logTag}) => {
  const subscribeLog = logConsole(logName, logTag)
  return function subscribeHandler (topic) {
    subscribeLog('subscription set source to topics', topic)

    return postal.subscribe({
      busChannel,
      topic,
      callback: function busToStreamHandler (data, envelope) {
        sink
          ::_do(() => { subscribeLog(`subscription got message on [${topic}]`) })
          ::_catch(error => { console.error('subscribe got error', logTag, error) })
          .next({data, envelope})
      },
    })
  }
}

const isValid = validate => pipe(validate, head)

export function getSource ({topics, logTag}) {
  const sink = new Subject()
  const postalSubs = topics.map(subscribe({sink, logTag}))
  return {
    postalSubs,
    source: sink.asObservable()
      ::_catch(error => { console.error('getSource got error', logTag, error) }),
  }
}

export function getSink ({targets, logTag}) {
  return when(
    data => data !== undefined,
    function publishHandler (data) {
      const publishLog = logConsole(logName, logTag)
      targets
        .forEach(topic => {
          publishLog(`publishing data to [${topic}]`)
          postal.publish({busChannel, topic, data})
        })
    })
}

export function connect ({topics, logTag, validate, handler, targets = []}) {
  const connectLog = logConsole(logName, 'connect', logTag)
  let savedInput
  const stream = getSource({topics, logTag}).source
    ::map(prop('data'))
    ::filter(isValid(validate))
    ::_do(input => { savedInput = input })
    ::map(handler)
    ::_catch(error => {
      connectLog('Error, restore stream', `${topics} -> ${logTag} -> ${targets}`, error)
      getSink({targets, logTag})({...savedInput, error})
      return stream
    })
    ::map(getSink({targets, logTag}))
    ::_catch(error => {
      console.error('connect got error', logTag, targets, error)
      return Promise.reject()
    })

  return stream.subscribe()
}

export function toBusAdapter ({sinks, logTag}) {
  const adpaterLog = logConsole(logName, 'toBusAdapter', logTag)
  return function messageHandler (message) {
    if (isValid(validate)) {
      const target = message.envelope.topic
      const sink = sinks[target] = sinks[target] || getSink({targets: [target], logTag})
      sink(message.data)
    } else {
      adpaterLog('Invalid data.')
    }
  }
}
