import {logConsole} from './logger'
import h from 'inferno-hyperscript'
import validateAndLog from './json-schema'
import {range} from 'ramda'
import {getSink} from './connect-postal'

const logName = 'stateRepresentation'
const log = logConsole(logName)

export const validate = validateAndLog({
  // required: ['view', 'stuff'],
  // properties: {
  //   view: {type: 'string'},
  //   stuff: {
  //     // required: ['session', 'field', 'id', 'userName'],
  //     properties: {
  //       field: {type: 'number'},
  //       userName: {oneOf: [{type: 'string'}, {type: 'null'}]},
  //     },
  //   },
  // },
}, log)

const numbers = range(1, 12).map(x => Math.random())
const list = () =>
  h('div.list', numbers.map((x, i) => {
    if (Math.random() < 0.5) {
      numbers[i] = Math.random()
    }
    return h('p.row', numbers[i])
  }))

const actionSink = (action, arg, options) =>
  getSink({targets: ['actions'], logTag: logName})({action, arg, ...options})

const incrementButton = (stuff, token, disabled) =>
  h('button', {
    onclick () { actionSink('incrementField', undefined, {token}) },
    disabled,
  }, 'increment field')

const fields = (stuff, token) =>
  h('p.fields', [
    h('p', [h('span', 'token: '), h('span', token || 'no token')]),
    h('p', [h('span', 'streamID: '), h('span', stuff.streamID || 'no streamID')]),
    h('p', [h('span', 'field: '), h('span', stuff.field)]),
    incrementButton(stuff, token),
  ])

const userButton = (stuff, token) =>
  h('button', {
    onclick () {
      const input = document.querySelector('#loginUserName')
      actionSink('userSession', input && input.value || null, {token})
    },
  }, stuff.userName ? `Log Out ${stuff.userName}` : 'Log In')

const user = (stuff, token) => {
  const {userName} = stuff
  return h('p.user', [
    h('h2', 'User'),
    userName
      ? h('p', [h('span', 'User Name: '), h('span', userName)])
      : h('p', [h('input#loginUserName', {placeholder: 'Enter User Name'})]),
    userButton(stuff, token),
  ])
}

const root = children => h('div#state-representation', children)

const views = {
  initial ({stuff, token}) {
    return root([
      user(stuff, token),
      fields(stuff, token),
      list(),
    ])
  },
  error ({message, stack}) {
    // debugger
    console.log('rep = error error error error error')
    return root([
      h('p.err', message),
      h('p.err', stack),
    ])
  },
}

export default (input) => {
  // throw new Error('sladi state-rep')
  console.log('state-pre', input)

  const {view, ...args} = input
  return views[view](args)
}
