import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  properties: {
    action: {
      enum: ['init', 'incrementField', 'userSession', 'broadcast'],
    },
  },
}, log)

const actions = {
  init (arg) {
    return {init: arg}
  },
  broadcast () {
    return {isBroadcast: true}
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
  // throw new Error('sladi actions')
  let token
  if (input.action === 'init' && input.arg && input.arg.server === true) {
    return {...actions[input.action](input.arg)}
  } else if (input.action === 'init' && !input.arg) {
    const newToken = jwt.sign({
      streamID: `${Math.random().toString(36).substr(2, 16)}`,
    }, 'secret', {expiresIn: '600d'})
    token = jwt.verify(newToken, 'secret')
  } else {
    token = jwt.verify(input.token, 'secret')
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
