import {logConsole} from '../../../shared/boundary/logger'
import {getSource} from '../../../shared/boundary/connect-postal'
import {map} from 'rxjs/operator/map'
import {_catch} from 'rxjs/operator/catch'

const logName = 'bus-to-http-adapter'
const log = logConsole(logName)

function busToBody (message) {
  log('map action data')
  return JSON.stringify(message)
}

const defaultOptions = {
  credentials: 'same-origin',
  // credentials: 'include',
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=UTF-8',
  },
}

export default function busToHttpAdapter ({url, targets}) {
  function sendHttp (body) {
    fetch(new Request(url, {...defaultOptions, body}))
      .then(response => {
        log('got response from action', response.status)
      })
      .catch(log)
  }

  let {postalSubs, source} = getSource({topics: targets, logTag: logName})
  source
    ::map(busToBody)
    ::_catch(error => {
      postalSubs.forEach(sub => { sub.unsubscribe() })
      log(logName, error)
    })
    .subscribe(sendHttp)
}
