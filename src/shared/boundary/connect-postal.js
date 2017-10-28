import {logConsole} from './logger'
// import postal from 'postal/lib/postal.lodash'
import {Subject} from 'rxjs/Subject'
import {map} from 'rxjs/operator/map'
import {filter} from 'rxjs/operator/filter'
import {_do} from 'rxjs/operator/do'
import {_catch} from 'rxjs/operator/catch'
import {prop, when, pipe, head, equals, not} from 'ramda'
import validateAndLog from './json-schema'

import EventEmitter from 'events'

export const busChannel = 't_bo-sam'

const logName = 'connect-postal'
const log = logConsole(logName)

export const validate = validateAndLog({
  // required: ['envelope', 'data'],
  // properties: {
  //   envelope: {
  //     required: ['channel', 'data', 'timeStamp', 'topic'],
  //     properties: {
  //       channel: {type: 'string'},
  //       timeStamp: {type: 'string'},
  //       topic: {type: 'string'},
  //     },
  //   },
  // },
}, log)

const em = new EventEmitter()
// em.on('actions', e => {
//   console.log('fu', e)
// })

const sinks = {
  topic: new Subject(),
}

const subscribe = ({sink, logTag}) => {
  try {
    const subscribeLog = logConsole(logName, logTag)
    return function subscribeHandler (topic) {
      subscribeLog('subscription set source to topics', topic)

      console.log('adsf subscribe, sink with subs', topic)
      const callback = function busToStreamHandler (data, envelope) {
        try {
          console.log('adsf subscribe cb, sink with subs', topic, '\n', data)
          sink
            ::_do(() => { subscribeLog(`subscription got message on [${topic}]`) })
            ::_do(() => { console.log(`subscription got message on [${topic}]`) })
            ::_catch(error => { console.log('subscribe got error', logTag, error); debugger })
            .next({data, envelope})
        } catch (e) {
          debugger
        }
      }
      em.on(topic, callback)
      return {
        unsubscribe () {
          em.removeListener(topic, callback)
        }
      }

      // return postal.subscribe({
      //   channel: busChannel,
      //   topic,
      //   callback: function busToStreamHandler (data, envelope) {
      //     try {
      //       sink
      //         ::_do(() => { subscribeLog(`subscription got message on [${topic}]`) })
      //         ::_catch(error => { console.error('subscribe got error', logTag, error) })
      //         .next({data, envelope})
      //     } catch (e) {
      //       debugger
      //     }
      //   },
      // })
    }
  } catch (e) {
    debugger
  }
}

const isValid = validate => pipe(validate, head) || validate === true

export function getSource ({topics, logTag}) {
  try {
    const sink = new Subject()
    console.log('|||||||||||||||||||||||||| getsrc', topics, sink)
    const postalSubs = topics.map(subscribe({sink, logTag}))
    return {
      postalSubs,
      source: sink.asObservable()
        ::_do(m => { console.log('================con src', topics) })
        ::_catch(error => { console.error('getSource got error', logTag, error) }),
    }
  } catch (e) {
    debugger
  }
}

export function getSink ({targets, logTag}) {
  try {
    return when(
      pipe(equals(undefined), not),
      pipe(
        ::Promise.resolve,
        function publishHandler (dataPromise) {
          try {
            dataPromise.then(data => {
              const publishLog = logConsole(logName, logTag)
              const dataItems = Array.isArray(data) ? data : [data]
              dataItems.forEach(dataItem => {
                targets
                  .forEach(topic => {
                    publishLog(`publishing data to [${topic}]`)
                    // postal.publish({channel: busChannel, topic, data: dataItem})
                    // if (typeof window === 'undefined' && topic === 'actions' && dataItem.action === 'initClient') {
                    //   console.log('pub\n', busChannel, '\n', topic, '\n', targets, '\n', dataItem)
                    //   postal.publish({channel: busChannel, topic: 'model', data: {foo: true}})
                    // }
                    const hadListeners = em.emit(topic, dataItem)
                    console.log(hadListeners, em)
                  })
              })
            })
          } catch (e) {
            debugger
          }
        }
      ))
  } catch (e) {
    debugger
  }
}

export function connect ({topics, logTag, validate, handler, targets = []}) {
  try {
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
  } catch (e) {
    debugger
  }
}

export function toBusAdapter ({sinks, logTag}) {
  try {
    const adapterLog = logConsole(logName, 'toBusAdapter', logTag)
    return function messageHandler (message) {
      if (isValid(validate)) {
        // const target = message.envelope.topic
        // const sink = sinks[target] = sinks[target] || getSink({targets: [target], logTag})
        // const sink = getSink({targets: [target], logTag})
        // console.log('Fuck this\n', em, '\n', sink.subscribers)
        // sink(message.data)
        console.log('Fuck this\n', em, '\n', message.envelope.topic)
        em.emit(message.envelope.topic, message.data)
      } else {
        adapterLog('Invalid data.')
      }
    }
  } catch (e) {
    debugger
  }
}
