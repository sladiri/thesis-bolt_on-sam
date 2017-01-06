import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {getSink} from '../boundary/connect-postal'
import jwt from 'jsonwebtoken'

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

const actionSink = getSink({targets: ['actions'], logTag: logName})

/**
 * - Calculate application state
 * - A pure and stateless function
 */
export function state (input) {
  // throw new Error('sladi state')
  const {error, isBroadcast, token, stuff} = input

  if (error) {
    return {
      ...input,
      view: 'error',
      message: input.error.message,
      stack: input.error.stack,
    }
  }
  if (isBroadcast && token) {
    setTimeout(() => {
      actionSink({action: 'broadcast', token: jwt.sign(token, 'secret')})
    }, 0)
    return
  }

  if (stuff && token) {
    stuff.userName = token.userName
    stuff.streamID = token.streamID
  }
  return {
    ...input,
    view: 'initial',
  }
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
