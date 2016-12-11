/* global HTMLElement */

import {logConsole} from '../shared/logger'
import morphdom from 'morphdom'
import h from 'hyperscript'
import validate from '../shared/json_schema'

const log = logConsole('render_dom')

const validInput = validate({
  properties: {
    node: {instanceof: HTMLElement},
  },
}, log)

const domTarget = document.getElementById('root')

export function onRender (input) {
  if (!validInput(input)) { return }

  morphdom(domTarget, h('div#root', input.node))
}

export function connect () {
  return {
    handlers: [onRender],
    targets: [],
  }
}
