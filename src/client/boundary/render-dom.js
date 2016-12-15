import {logConsole} from '../../shared/boundary/logger'
import morphdom from 'morphdom'
import h from 'hyperscript'
import stateRepresentation, {validate} from '../../shared/boundary/state-representation'

const log = logConsole('render_dom')

const domTarget = document.getElementById('root')

let rehydrate = true

function clearStaticRender () {

}

function onClientStateRepresentation (input) {
  const view = stateRepresentation({model: input.model})
  if (rehydrate) {
    const root = document.querySelector('#root')
    while (root.firstChild) {
      root.removeChild(root.firstChild)
    }
  }
  morphdom(domTarget, h('div#root', view))
  rehydrate = false
  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  validate,
  handler: onClientStateRepresentation,
}
