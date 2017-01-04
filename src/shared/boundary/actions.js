import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  properties: {
    action: {
      enum: ['init', 'incrementField', 'userSession'],
    },
  },
}, log)

const actions = {
  init (arg) {
    return {init: arg}
  },
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
  if (input.action === 'init' && input.arg === 'server') {
    return {...actions[input.action](input.arg)}
  }
  let token = {}
  try {
    token = input.token
      ? jwt.verify(input.token, 'secret')
      : token
  } catch ({message}) {
    log('token error', message)
    token = {...token, expired: true}
  }
  return {
    ...actions[input.action](input.arg),
    token,
  }
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
