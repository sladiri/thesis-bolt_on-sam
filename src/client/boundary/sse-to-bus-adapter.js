/* global EventSource */

import {logConsole} from '../../shared/boundary/logger'
import {getSink} from '../../shared/boundary/connect-postal'

const log = logConsole('sse')
const logMessage = (state, event) =>
  `${state} ${event.target.url} ; readyState = ${event.target.readyState}`

export default url => {
  let source = new EventSource(url)
  let sinks = {}
  source.addEventListener('message', event => {
    const payload = JSON.parse(event.data)
    const target = payload.envelope.topic
    const sink = sinks[target] = sinks[target] || getSink({targets: [target]})
    sink(payload.data)
  })

  source.addEventListener('open', event => {
    log(logMessage('open', event))
  })

  source.addEventListener('error', event => {
    source = undefined
    sinks = undefined
    if (event.readyState === EventSource.CLOSED) {
      log(logMessage('closed', event))
    } else {
      log(logMessage('error', event))
    }
  })
}
