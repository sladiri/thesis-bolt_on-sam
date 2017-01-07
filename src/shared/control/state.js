import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {getSink} from '../boundary/connect-postal'
import jwt from 'jsonwebtoken'
import {path} from 'ramda'

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
  console.log('state meta', input.meta)
  if (input.wasBroadcast) {
    // debugger
  }
  // throw new Error('sladi state')
  const {error, token, stuff} = input

  if (error) {
    // debugger
    return {
      ...input,
      view: 'error',
      message: error.message,
      stack: error.stack,
    }
  }
  if (path(['meta', 'tobeBroadcast'], input) && input.isBroadcast) {
    debugger
  }
  if (path(['meta', 'tobeBroadcast'], input) && token) {
    setTimeout(() => {
      actionSink({action: 'broadcast', token: jwt.sign(token, 'secret')})
    }, 0)
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
