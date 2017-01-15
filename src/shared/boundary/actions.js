import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  // properties: {
  //   action: {
  //     enum: ['initServer', 'initClient', 'incrementField', 'userSession', 'broadcast'],
  //   },
  // },
}, log)

const actions = {
  initServer () {
    return {init: 'server'}
  },
  initClient ({token}) {
    const {streamID} = jwt.verify(token, 'secret')
    return {init: 'client', token: jwt.sign({streamID}, 'secret', {expiresIn: '1y'})}
  },
  broadcast ({token}) {
    const {streamID} = jwt.verify(token, 'secret')
    return {broadcasterID: streamID}
  },
  incrementField ({arg, token}) {
    return {mutation: 'increment', amount: arg}
  },
  userSession ({arg}) {
    return {mutation: 'userSession', userName: arg}
  },
}

/**
 * - Context specifiic logic (eg. set default value)
 * - Calls external API (eg. validation service)
*/
export function onAction (input) {
  const {action, ...args} = input

  console.log('action args', action, '\n', args)

  let actionResult

  try {
    actionResult = {
      token: input.token,
      ...(actions[action](args) || {}),
    }
  } catch (error) {
    debugger
    log('Invalid client action', actionResult.error)
    return
  }

  try {
    actionResult.token = jwt.verify(actionResult.token, 'secret')
  } catch (error) {
    debugger
    return
  }

  console.log('action result', action, actionResult)

  return actionResult
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
