import {logConsole} from '../../shared/boundary/logger'
import {render} from 'inferno-dom'
import {__, curry, pipe} from 'ramda'
import stateRepresentation, {validate} from '../../shared/boundary/state-representation'

const logName = 'render-dom'
const log = logConsole(logName)

const domTarget = document.getElementById('root')

function onStateRepresentation (input) {
  pipe(
    stateRepresentation,
    curry(render)(__, domTarget)
  )(input)

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onStateRepresentation,
}
