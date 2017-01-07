import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'
import {path} from 'ramda'

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
    // debugger
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
  // console.log('action start', input.meta)
  let token
  const meta = {}
  if (input.action === 'init' && path(['arg', 'server'], input) === true) {
    return {...actions[input.action](input.arg)}
  } else if (input.action === 'init' && !input.arg) {
    const newToken = jwt.sign({
      streamID: `${Math.random().toString(36).substr(2, 16)}`,
    }, 'secret', {expiresIn: '20s'})
    token = jwt.verify(newToken, 'secret')
  } else {
    try {
      token = jwt.verify(input.token, 'secret')
    } catch (error) {
      // debugger
      console.log('||||||||||||||||||||||||| expired token')
      token = jwt.decode(input.token, 'secret')
      meta.expiredToken = true
      // if (input.action === 'broadcast') { meta.tobeBroadcast = true }
    }
  }
  console.log('action end', meta)
  return {
    ...actions[input.action](input.arg),
    token,
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
