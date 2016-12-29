import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['meta'],
  properties: {
    meta: {
      properties: {
        secret: {type: 'string'},
      },
    },
  },
}, log)

export function onAction ({meta}) {
  return {
    meta,
  }
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
