import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  properties: {
    action: {
      enum: ['incrementField', 'userSession'],
    },
  },
}, log)

const actions = {
  incrementField (increment = 1) {
    return {increment}
  },
  userSession (userName) {
    return {userName}
  },
}

/**
 * - Context specifiic logic (eg. set default value)
 * - Calls external API (eg. validation service)
*/
export function onAction (input) {
  const {action, arg} = input
  return action
    ? {
      ...input,
      ...actions[action](arg),
    }
    : input
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
