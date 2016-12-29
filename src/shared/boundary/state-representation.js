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

const numbers = range(1, 100).map(x => Math.random())
function list () {
  return h('div.list', numbers.map((x, i) => {
    if (Math.random() < 0.5) {
      numbers[i] = Math.random()
    }
    return h('p.row', numbers[i])
  }))
}

function pCount ({field}) {
  return h('p.count', field)
}

const actionSink = getSink({targets: ['actions'], logTag: logName})
if (typeof window !== 'undefined') {
  console.log('clicking action')
  setInterval(() => {
    actionSink(null)
  }, 100)
}

function button ({field, disabled}) {
  return h('button', {
    onclick: () => {
      log('field', field)
      actionSink(null)
    },
    disabled,
  }, 'Increment Button')
}

function root (children) {
  return h('div#state-representation', children)
}

const views = {
  initial (model) {
    return root([
      pCount(model),
      h('br'),
      button(model),
      h('br'),
      list(),
    ])
  },

  danger (model) {
    return root([
      pCount(model),
      h('br'),
      button({...model, disabled: true}),
      h('br'),
      h('span.danger', 'DANGER'),
    ])
  },
}

export default function stateRepresentation ({model}) {
  const view = views.initial(model)
  return view
}
