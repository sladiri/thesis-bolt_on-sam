import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  properties: {
    foo: {type: 'string'},
  },
}, log)

export function onAction (input) {
  return null
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
