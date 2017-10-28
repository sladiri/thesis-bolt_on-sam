import {logConsole} from '../../shared/boundary/logger'
import {toBusAdapter} from '../../shared/boundary/connect-postal'
import {pipe, when, prop, not, tap, path} from 'ramda'

const logName = 'sse-to-bus-adapter'
const log = logConsole(logName)

const logMessage = event =>
  [event.target.url, `readyState = ${event.target.readyState}`]

const saveTokenToLocalStorage = message => {
  const token = path(['data', 'token'], message)
  localStorage.setItem('tboToken', token)
}

const toBus = sinks => {
  const adapter = toBusAdapter({sinks, logTag: logName})
  return pipe(
    prop('data'),
    ::JSON.parse,
    when(
      pipe(prop('KA'), not),
      pipe(tap(saveTokenToLocalStorage), adapter)),
  )
}

export default function sseToBusAdapter (url) {
  let source = new EventSource(url)
  const sinks = {}

  function openHandler (event) {
    log('open', ...logMessage(event))
    source.removeEventListener('open', openHandler)
    source.addEventListener('message', toBus(sinks))
  }

  function errorHandler (event) {
    if (event.readyState === EventSource.CLOSED) {
      log('closed', ...logMessage(event))
    } else {
      log('error', ...logMessage(event))
    }
    source = undefined
    Object.keys(sinks).forEach(sink => {
      delete sinks[sink]
    })
  }

  source.addEventListener('open', openHandler)
  source.addEventListener('error', errorHandler)
}
