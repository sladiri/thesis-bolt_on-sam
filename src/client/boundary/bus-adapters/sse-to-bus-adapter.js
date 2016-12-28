import {logConsole} from '../../../shared/boundary/logger'
import {getSink} from '../../../shared/boundary/connect-postal'

const logName = 'sse-to-bus-adapter'
const log = logConsole(logName)

const logMessage = event =>
  [event.target.url, `readyState = ${event.target.readyState}`]

export default url => {
  let source = new EventSource(url)
  let sinks = {}

  function messageHandler (event) {
    log('got message', JSON.stringify(event))
    const payload = JSON.parse(event.data)
    const target = payload.envelope.topic
    sinks = sinks || {}
    const sink = sinks[target] = sinks[target] || getSink({targets: [target]})
    sink(payload.data)
  }

  function openHandler (event) {
    log('open', ...logMessage(event))
    source.removeEventListener('open', openHandler)
    source.addEventListener('message', messageHandler)
  }

  function errorHandler (event) {
    if (event.readyState === EventSource.CLOSED) {
      log('closed', ...logMessage(event))
    } else {
      log('error', ...logMessage(event))
    }
    source = undefined
    sinks = undefined
  }

  source.addEventListener('open', openHandler)
  source.addEventListener('error', errorHandler)
}
