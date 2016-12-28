import {logConsole} from '../../shared/boundary/logger'
import {render as _render} from 'inferno-dom'
import {__, curry, pipe} from 'ramda'
import stateRepresentation, {validate} from '../../shared/boundary/state-representation'

const logName = 'render_dom'
const log = logConsole(logName)

const render = curry(_render)
const domTarget = document.getElementById('root')

function onClientStateRepresentation (input) {
  pipe(
    stateRepresentation,
    render(__, domTarget)
  )(input)

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onClientStateRepresentation,
}
