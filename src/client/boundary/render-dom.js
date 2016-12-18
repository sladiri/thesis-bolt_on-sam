import {logConsole} from '../../shared/boundary/logger'
import {render as _render} from 'inferno-dom'
import {__, curry, pipe} from 'ramda'
import stateRepresentation, {validate} from '../../shared/boundary/state-representation'

const log = logConsole('render_dom')

const render = curry(_render)
const domTarget = document.getElementById('root')

function onClientStateRepresentation (input) {
  if (!validate(input)) { return }

  pipe(
    stateRepresentation,
    render(__, domTarget)
  )({model: input.model})

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  validate,
  handler: onClientStateRepresentation,
}
