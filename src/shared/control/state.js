import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

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
  const {error, token, noOp, stuff} = input

  if (error) {
    return {
      ...input,
      view: 'error',
      message: error.message,
      stack: error.stack,
    }
  }

  if (noOp) {
    return
  }

  // decide, which actions are allowed ...

  stuff.userName = token.userName
  stuff.streamID = token.streamID

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
