import {logConsole} from './logger'
import validateAndLog from './json-schema'
import h from 'hyperscript'
// import * as actions from './actions'

const log = logConsole('state-state-representation')

export const validate = validateAndLog({
  properties: {
    model: {
      field: {type: 'number'},
    },
  },
}, log)

// const increment = value => {
//   getSignal().then(signal => {
//     signal(actions.increment({value}))
//   })
// }

function increment () { console.log(`Fake click ${new Date()}`) }

function pCount ({field}) {
  return h('p.count', field)
}

function button ({field, disabled}) {
  return h('button', {
    onclick: increment,
    disabled,
  }, `Increment Button ${field}`)
}

function root ({children}) {
  return h('div#root', ...children)
}

const views = {
  initial (model) {
    return root({
      children: [
        pCount(model),
        h('br'),
        button(model),
      ],
    })
  },

  danger (model) {
    return root({
      children: [
        pCount(model),
        h('br'),
        button({...model, disabled: true}),
        h('br'),
        h('span.danger', 'DANGER'),
      ],
    })
  },
}

export default function stateRepresentation (payload) {
  const view = views.initial(payload.model)
  return view
}
