import {logConsole} from '../../../shared/boundary/logger'
import {getSource} from '../../../shared/boundary/connect-postal'
import {map} from 'rxjs/operator/map'
import {_catch} from 'rxjs/operator/catch'
import {_do} from 'rxjs/operator/do'
import {from} from 'rxjs/observable/from'
import {mergeMap} from 'rxjs/operator/mergeMap'
import {pipe, identity} from 'ramda'

const logName = 'bus-to-http-adapter'
const log = logConsole(logName)

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
    ::map(message => JSON.stringify(message))
    ::map(body => ({...defaultOptions, body}))
    ::map(options => new Request(url, options))
    ::mergeMap(pipe(identity, ::window.fetch, from)) // bug, must provide some function before fetch
    ::_do(response => { log(`Response from action request = [${response.status}]`) })
    ::_catch(error => {
      postalSubs.forEach(sub => { sub.unsubscribe() })
      postalSubs = source = undefined
      log('Unsubscribed', error)
    })
    .subscribe()
}
