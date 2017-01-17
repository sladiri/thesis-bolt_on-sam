import {logConsole} from '../../../shared/boundary/logger'
import {getSource} from '../../../shared/boundary/connect-postal'
import {map} from 'rxjs/operator/map'
import {_catch} from 'rxjs/operator/catch'
import {from} from 'rxjs/observable/from'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {pipe, identity} from 'ramda'

const logName = 'bus-to-http-adapter'
const log = logConsole(logName)

const createFetchOptions = message =>
  ({
    ...defaultOptions,
    body: JSON.stringify(message),
  })

const createFetchRequest = url => options => new Request(url, options)

const defaultOptions = {
  credentials: 'same-origin',
  // credentials: 'include',
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=UTF-8',
  },
}

export default function busToHttpAdapter ({url, targets}) {
  let {postalSubs, source} = getSource({topics: targets, logTag: logName})

  source
    ::map(createFetchOptions)
    ::map(createFetchRequest(url))
    ::mergeMap(pipe(identity, ::window.fetch, from)) // bug, must provide some function before fetch
    ::_catch(error => {
      postalSubs.forEach(sub => { sub.unsubscribe() })
      log('Unsubscribed', error)
    })
    .subscribe(response => {
      log('got response from action', response.status)
    })
}
