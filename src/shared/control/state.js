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

  const {model, ...options} = input
  const {token: {data: tokenData}} = input

  tokenData.allowedActions = Object.keys(actions)

  const stuff = {
    ticker: model.ticker,
  }

  // stuff.field = model.field
  // stuff.groups = map(prop('name'), model.groups)

  // stuff.streamID = tokenData.streamID || 'no streamID'
  // stuff.userName = tokenData.userName
  // stuff.tock = tokenData.tock
  // stuff.group = model.groups.filter(group => group.members.indexOf(tokenData.userName) >= 0).map(prop('name')).join(', ')
  // stuff.groupPosts = (model.groups.find(group => group.members.includes(tokenData.userName)) || {}).posts || []
  // stuff.isAdmin = tokenData.isAdmin
  // stuff.users = stuff.isAdmin && model.users

  const view = tokenData.userName ? 'loggedIn' : 'initial'

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
