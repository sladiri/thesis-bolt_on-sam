import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'state'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['meta'],
  properties: {
    meta: {
      properties: {
        sessionId: {type: 'number'},
      },
    },
  },
}, log)

/**
 * - Calculate application state
 * - A pure and stateless function
 */
export function onState (input) {
  return {
    ...input,
    view: 'initial',
  }
}

export default {
  topics: ['state'],
  logTag: logName,
  validate,
  handler: onState,
  targets: ['stateRepresentation'],
}
