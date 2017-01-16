import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['token', 'action'],
  properties: {
    action: {
      enum: ['initServer', 'initClient', 'incrementField', 'userSession', 'broadcast', 'groupMessage'],
    },
  },
}, log)

const checkAllowedActions = (action, token) => {
  if (!(action === 'initServer' || action === 'initClient')) {
    const {allowedActions} = jwt.verify(token, 'secret')
    if (!allowedActions.includes(action)) {
      return false
    }
  }
}

export const actions = {
  initServer (args) {
    // TODO: allow reuse of session after reload
    // console.log(args)
    // if (args.token) {
    //   console.log(jwt.decode(args.token, 'secret'))
    // }
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
  incrementField ({arg}) {
    return {mutation: 'increment', amount: arg}
  },
  userSession ({arg}) {
    return {mutation: 'userSession', userName: arg || null}
  },
  groupMessage ({arg: {group, message}}) {
    return {mutation: 'postMessage', group, message}
  },
}

/**
 * - Context specifiic logic (eg. set default value)
 * - Calls external API (eg. validation service)
*/
export function onAction (input) {
  const {action, ...args} = input

  log('Action intent', action)

  if (checkAllowedActions(action, args.token) === false) {
    log('Forbidden client action', action, args.token.allowedActions)
    return
  }

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

  // console.log('action result', action, actionResult)

  return actionResult
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
