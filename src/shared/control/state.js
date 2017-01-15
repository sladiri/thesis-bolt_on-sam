import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {map, prop} from 'ramda'

const logName = 'state'
const log = logConsole(logName)

export const validate = validateAndLog({
  // required: ['meta'],
  // properties: {
  //   meta: {
  //     properties: {
  //       sessionId: {type: 'number'},
  //     },
  //   },
  // },
}, log)

/**
 * - Calculate application state
 * - A pure and stateless function
 */
export function state (input) {
  const {error} = input

  if (error) {
    return {
      ...input,
      view: 'error',
      message: error.message,
      stack: error.stack,
    }
  }

  if (input.noOp) { return }

  // decide, which actions are allowed ...

  const {token, data, ...options} = input
  const stuff = {}

  stuff.field = data.field
  stuff.groups = map(prop('name'), data.groups)

  stuff.streamID = token.streamID || 'no streamID'
  stuff.userName = token.userName
  stuff.group = (data.groups.find(group => group.members.indexOf(token.userName) >= 0) || {}).name
  stuff.groupPosts = (data.groups.find(group => group.members.includes(token.userName)) || {}).posts || []

  const view = token.userName ? 'loggedIn' : 'initial'

  return {...options, token, view, stuff}
}

export function onState (input) {
  return state(input)
}

export default {
  topics: ['state'],
  logTag: logName,
  validate,
  handler: onState,
  targets: ['stateRepresentation'],
}
