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
  let token
  if (input.action === 'init' && input.arg && input.arg.server === true) {
    return {...actions[input.action](input.arg)}
  } else if (input.action === 'init' && !input.arg) {
    const newToken = jwt.sign({
      streamID: `${Math.random().toString(36).substr(2, 16)}`
    }, 'secret', {expiresIn: '2h'})
    token = jwt.verify(newToken, 'secret')
  } else {
    token = jwt.verify(input.token, 'secret')
  }
  return {
    ...input,
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
