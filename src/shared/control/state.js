import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {map, prop} from 'ramda'
import {actions} from '../boundary/actions'

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

  const {model, ...options} = input
  const {token: {data}} = input

  const allowedActions = Object.keys(actions)
  data.allowedActions = allowedActions

  const stuff = {}

  stuff.field = model.field
  stuff.groups = map(prop('name'), model.groups)

  stuff.streamID = data.streamID || 'no streamID'
  stuff.userName = data.userName
  stuff.group = (model.groups.find(group => group.members.indexOf(data.userName) >= 0) || {}).name
  stuff.groupPosts = (model.groups.find(group => group.members.includes(data.userName)) || {}).posts || []

  const view = data.userName ? 'loggedIn' : 'initial'

  return {...options, view, stuff}
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
