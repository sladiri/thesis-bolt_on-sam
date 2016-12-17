import {logConsole} from './logger'
import validateAndLog from './json-schema'
import h from 'hyperscript'
import {range} from 'ramda'
// import * as actions from './actions'

const log = logConsole('state-state-representation')

export const validate = validateAndLog({
  properties: {
    model: {
      field: {type: 'number'},
    },
  },
}, log)

const numbers = range(1, 10).map(x => Math.random())
function row (x, i) {
  if (Math.random() < 0.5) {
    list[i] = Math.random()
  }
  return h('p.row', list[i])
}
function list () {
  const children = numbers.map(row)
  return h('div.list', ...children)
}

// const increment = value => {
//   getSignal().then(signal => {
//     signal(actions.increment({value}))
//   })
// }

function increment (field) { console.log(`Fake click | ${field} | ${new Date()}`) }

function pCount ({field}) {
  return h('p.count', field)
}

function button ({field, disabled}) {
  return h('button', {
    onclick: () => increment(field),
    disabled,
  }, 'Increment Button')
}

function root (children) {
  return h('div#state-representation', ...children)
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

export default function stateRepresentation (payload) {
  const view = views.initial(payload.model)
  return view
}
