import {logConsole} from './logger'
import h from 'inferno-hyperscript'
import validateAndLog from './json-schema'
import {range} from 'ramda'
import {getSink} from '../../shared/boundary/connect-postal'

const logName = 'state-representation'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['model'],
  properties: {
    model: {
      required: ['field'],
      properties: {
        field: {type: 'number'},
      },
    },
  },
}, log)

const numbers = range(1, 12).map(x => Math.random())
function list () {
  return h('div.list', numbers.map((x, i) => {
    if (Math.random() < 0.5) {
      numbers[i] = Math.random()
    }
    return h('p.row', numbers[i])
  }))
}

const actionSink = getSink({targets: ['actions'], logTag: logName})

function button (meta, {field, disabled}) {
  return h('button', {
    onclick: () => {
      log('field', field)
      actionSink({meta})
    },
    disabled,
  }, 'Increment Button')
}

function root (children) {
  return h('div#state-representation', children)
}

const views = {
  initial ({meta, model}) {
    return root([
      h('p.count', model.field),
      h('p', model.id || 'no id'),
      h('br'),
      button(meta, model),
      h('br'),
      list(),
    ])
  },
}

export default function stateRepresentation (input) {
  const view = views.initial(input)
  return view
}
