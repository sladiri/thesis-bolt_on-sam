import {logConsole} from './logger'
import h from 'inferno-hyperscript'
import validateAndLog from './json-schema'
import {range} from 'ramda'
import {getSink} from '../../shared/boundary/connect-postal'

const logName = 'stateRepresentation'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['model'],
  properties: {
    meta: {type: 'object'},
    model: {
      required: ['field'],
      properties: {
        field: {type: 'number'},
        userName: {oneOf: [{type: 'string'}, {type: 'null'}]},
      },
    },
  },
}, log)

const numbers = range(1, 12).map(x => Math.random())
const list = () =>
  h('div.list', numbers.map((x, i) => {
    if (Math.random() < 0.5) {
      numbers[i] = Math.random()
    }
    return h('p.row', numbers[i])
  }))

const actionSink = (action, arg) =>
  getSink({targets: ['actions'], logTag: logName})({action, arg})

const incrementButton = (disabled) =>
  h('button', {
    onclick () { actionSink('incrementField') },
    disabled,
  }, 'increment field')

const fields = (model) =>
  h('p.fields', [
    h('h2', 'model fields'),
    h('p', [h('span', 'field: '), h('span', model.field)]),
    h('p', [h('span', 'id: '), h('span', model.id)]),
    h('p', [h('span', 'secret: '), h('span', model.secret)]),
    incrementButton(),
  ])

const userButton = (model) =>
  h('button', {
    onclick () {
      actionSink('session', {
        loginInput: document.querySelector('#loginUserName').value,
      })
    },
  }, model.userName ? `Log Out ${model.userName}` : 'Log In')

const user = (model) => {
  const {userName} = model
  return h('p.user', [
    h('h2', 'User'),
    userName
      ? h('p', [h('span', 'User Name: '), h('span', userName)])
      : h('p', [h('input#loginUserName', {placeholder: 'Enter User Name'})]),
    userButton(model),
  ])
}

const root = children => h('div#state-representation', children)

const views = {
  initial (model) {
    return root([
      user(model),
      fields(model),
      list(),
    ])
  },
}

export default function stateRepresentation (input) {
  const {model} = input
  const view = views.initial(model)
  return view
}
