import {logConsole} from '../../shared/boundary/logger'
import {render} from 'inferno'
import {__, curry, pipe} from 'ramda'
import stateRepresentation, {validate} from '../../shared/boundary/state-representation'
import {getSink} from '../../shared/boundary/connect-postal'

const logName = 'render-dom'
const log = logConsole(logName)

const domTarget = document.getElementById('state-representation')
let init = true

function onStateRepresentation (input) {
  if (init) {
    while (domTarget.firstChild) {
      domTarget.removeChild(domTarget.firstChild)
    }
    init = false
  }

  pipe(
    stateRepresentation,
    curry(render)(__, domTarget),
  )(input)

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onStateRepresentation,
}

setTimeout(() => {
  const savedToken = sessionStorage.getItem('tboToken')
  getSink({targets: ['actions'], logTag: logName})({action: 'initClient', savedToken})
}, 200)
