import {logConsole} from '../../../shared/boundary/logger'
import {getSource} from '../../../shared/boundary/connect-postal'
import flyd from 'flyd'
import {pipe} from 'ramda'

const logName = 'bus-to-http-adapter'
const log = logConsole(logName)

function busToBody (message) {
  log('map data', JSON.stringify(message))
  return JSON.stringify(message.data)
}

const defaultOptions = {
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=UTF-8',
  },
}

export default function busToHttpAdapter (url) {
  function sendHttp (body) {
    fetch(new Request(url, {...defaultOptions, body}))
      .then(response => {
        log(body, response.status)
      })
      .catch(log)
  }

  const {source} = getSource({topics: ['*'], logTag: logName})
  pipe(
      flyd.map(busToBody),
      flyd.on(sendHttp),
    )(source)
}
