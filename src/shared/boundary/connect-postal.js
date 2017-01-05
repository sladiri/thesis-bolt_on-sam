import {logConsole} from './logger'
import postal from 'postal/lib/postal.lodash'
import {Subject} from 'rxjs/Subject'
import {map} from 'rxjs/operator/map'
import {filter} from 'rxjs/operator/filter'
import {_do} from 'rxjs/operator/do'
import {_catch} from 'rxjs/operator/catch'
import {prop, curry, when} from 'ramda'
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

function hasData (data) { return data !== undefined }

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
          ::_catch(error => { console.log('subscribe got error', logTag, error); debugger })
          .next({data, envelope})
      },
    })
  }
}

const publish = (targets, logTag) => function publishHandler (data) {
  const publishLog = logConsole(logName, logTag)
  targets.forEach(topic => {
    publishLog(`publishing data to [${topic}]`)
    postal.publish({busChannel, topic, data})
  })
}

const unsubscribe = (topics, logTag, targets, subs) => function unsubscribeHandler (end) {
  logConsole(logName, logTag)('unsubscribing', topics, targets)
  subs.forEach(sub => { sub.unsubscribe() })
}

// const setSink = ({targets, logTag, pipe}) => {
//   return pipe
//     ::filter(hasData)
//     ::_do(publish(targets, logTag))
//     ::_catch(error => { console.log('setSink got error', logTag, error); debugger })
// }

// function getPipe ({topics, logTag}) {
//   const pipe = new Subject() // keep this subject
//   const subs = topics.map(subscribe({pipe, logTag}))
//   return {subs, pipe}
// }

export function getSource ({topics, logTag}) {
  // const {subs, pipe} = getPipe({topics, logTag})

  const sink = new Subject() // keep this subject
  const subs = topics.map(subscribe({sink, logTag}))
  return {
    subs,
    source: sink.asObservable()
      ::_catch(error => { console.log('getSource got error', logTag, error); debugger }),
  }
}

export function getSink ({targets, logTag}) {
  return when(hasData, publish(targets, logTag))

  // const sink = setSink({targets, logTag, pipe: new Subject()})
  //   ::_catch(error => { console.log('getSink got error', logTag, error); debugger })

  // sink.subscribe()
  // return ::sink.next
}

const validateAndThrow = curry((adapterLog, validate, message) => {
  const [ok, errorMessage] = validate(message)
  if (!ok) {
    adapterLog('invalid json schema of message')
    throw new Error(errorMessage)
  }
  return true
})

export function connect ({topics, logTag, validate, handler, targets = []}) {
  const connectLog = logConsole(logName, 'connect', logTag)
  const {subs, source} = getSource({topics, logTag})

  return source
    ::map(prop('data'))
    ::filter(validateAndThrow(connectLog, validate))
    ::map(handler)
    // ::_catch(error => {
    //   console.log('connect got error', logTag, targets, error)
    //   debugger
    //   // unsubscribe(topics, logTag, targets, subs)
    // })
    ::map(getSink({targets, logTag}))
    .subscribe()

  // const pipe = source
  //   ::map(prop('data'))
  //   ::filter(validateAndThrow(connectLog, validate))
  //   ::map(handler)
  //   ::_catch(error => { console.log('connect1 got error', logTag, error); debugger })

  // return setSink({targets, logTag, pipe})
  //   ::_catch(error => { console.log('connect2 got error', logTag, error); debugger })
  //   .subscribe() // just return sink?
}

export function toBusAdapter ({sinks, logTag}) {
  const adapterLog = logConsole(logName, 'toBusAdapter', logTag)
  return function messageHandler (message) {
    validateAndThrow(adapterLog, validate, message)
    const target = message.envelope.topic
    const sink = sinks[target] = sinks[target] || getSink({targets: [target], logTag})
    sink(message.data)
  }
}
