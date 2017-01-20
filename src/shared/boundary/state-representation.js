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

const styles = {
  ellipsis: {
    'overflow-x': 'hidden',
    'text-overflow': 'ellipsis',
    'white-space': 'nowrap',
    width: '90%',
  },
  tiny: {'font-size': 'x-small'}
}

const numbers = range(1, 12).map(x => Math.random())
const list = () =>
  h('ul', numbers.map((x, i) => {
    if (Math.random() < 0.5) {
      numbers[i] = Math.random()
    }
    return h('li', {style: styles.tiny}, numbers[i])
  }))

const actionSink = getSink({targets: ['actions'], logTag: logName})

const incrementButton = (stuff, signal, disabled) =>
  h('button', {
    onclick () { signal('incrementField', 1) },
    disabled,
  }, 'increment field')

const fields = (stuff, signal) =>
  h('div.fields', {style: styles.ellipsis}, [
    h('h2', 'Fields'),
    h('span', 'streamID: '), h('span', stuff.streamID), h('br'),
    h('span', `field: ${stuff.field} - `), incrementButton(stuff, signal), h('br'),
  ])

const userActionButton = (stuff, signal, user) =>
  h('button', {
    onclick () { signal('toggleGroup', {user, group: 'admin'}) },
  }, 'toggle [group-A] member')

const adminActions = (stuff, signal) =>
  h('span', [
    'Users: ',
    ...stuff.users
      .filter(user => user !== stuff.userName)
      .map(user => h('span', [user, userActionButton(stuff, signal, user)])),
  ])

const userSessionButton = (stuff, signal, logout) =>
  h('button', {
    onclick () {
      const input = document.querySelector('#loginUserName')
      signal('userSession', logout ? null : input.value)
    },
  }, stuff.userName ? `Log Out ${stuff.userName}` : 'Log In')

const messageButton = (signal, group, message) =>
  h('button', {
    onclick () {
      signal('groupMessage', {group, message: `This is a random message for group '${group}': ${message}`})
    },
  }, `Send message to ${group}`)

const root = children => h('div#state-representation', children)

const views = {
  error ({message, stack}) {
    return root([
      h('p.err', message),
      h('p.err', stack),
    ])
  },
  initial ({stuff, signal}) {
    return root([
      h('p.user', [
        h('h2', 'User Login'),
        h('input#loginUserName', {placeholder: 'Enter User Name'}), userSessionButton(stuff, signal), h('br'),
      ]),
      fields(stuff, signal),
      list(),
    ])
  },
  loggedIn ({stuff, signal}) {
    return root([
      h('p.user', [
        h('h2', `User: ${stuff.userName}`),
        userSessionButton(stuff, signal, true), h('hr'),
        h('span', 'User Name: '), h('span', stuff.userName), h('br'),
        h('span', 'Group Name: '), h('span', stuff.group), h('br'),
        h('ul', stuff.groups.map(group => h('li', [messageButton(signal, group, `${Math.random()}`)]))),
        h('ul', stuff.groupPosts.map(post => h('li', post))),
        stuff.isAdmin === true ? adminActions(stuff, signal) : undefined,
      ]),
      fields(stuff, signal),
      list(),
    ])
  },
}

export default (input) => {
  if (!input.view && input.error) {
    log('Got error in state-rep without view, setting view to error')
    input.view = 'error'
    input.message = input.error.message
    input.stack = input.error.stack
  }

  const signal = (action, arg) =>
    actionSink({
      token: input.token,
      actionToken: input.actionToken,
      action,
      arg,
    })

  return views[input.view]({...input, signal})
}
