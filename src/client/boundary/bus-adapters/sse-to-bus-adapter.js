/* global EventSource */

import {logConsole} from '../../shared/boundary/logger'
import {getSink} from '../../shared/boundary/connect-postal'

const logMessage = event =>
  `${event.target.url} ; readyState = ${event.target.readyState}`

export default url => {
  let source = new EventSource(url)
  let sinks = {}

  function messageHandler (event) {
    const payload = JSON.parse(event.data)
    const target = payload.envelope.topic
    sinks = sinks || {}
    const sink = sinks[target] = sinks[target] || getSink({targets: [target]})
    sink(payload.data)
  }

  function openHandler (event) {
    logConsole('sse-to-bus-adapter', 'open')(logMessage(event))
    source.removeEventListener('open', openHandler)
    source.addEventListener('message', messageHandler)
  }

  function errorHandler (event) {
    if (event.readyState === EventSource.CLOSED) {
      logConsole('sse-to-bus-adapter', 'closed')(logMessage(event))
    } else {
      logConsole('sse-to-bus-adapter', 'error')(logMessage(event))
    }
    source = undefined
    sinks = undefined
  }

  source.addEventListener('open', openHandler)
  source.addEventListener('error', errorHandler)
}
