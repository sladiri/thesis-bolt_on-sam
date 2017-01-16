import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['action'],
  properties: {
    action: {
      enum: ['initServer', 'initClient', 'incrementField', 'userSession', 'broadcast', 'groupMessage'],
    },
  },
}, log)

const checkAllowedActions = (action, token) => {
  if (!(action === 'initServer' || action === 'initClient')) {
    const {data: {allowedActions}} = jwt.verify(token, 'secret')
    if (!allowedActions.includes(action)) {
      return false
    }
  }
}

export const actions = {
  initServer () {
    return {init: 'server'}
  },
  initClient ({token, savedToken}) {
    let oldData = {}
    if (savedToken) {
      try {
        oldData = jwt.verify(savedToken, 'secret').data || oldData
      } catch (error) {
        log('expired old token', error)
      }
    }
    const initToken = token ? jwt.verify(token, 'secret') : null
    const newData = initToken ? {...oldData, streamID: initToken.data.streamID} : oldData
    return {init: 'client', token: jwt.sign({data: newData}, 'secret', {expiresIn: '1y'})}
  },
  broadcast ({token}) {
    const {data: {streamID}} = jwt.verify(token, 'secret')
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
  try {
    const {action, ...args} = input

    log('Action intent', action)

    if (checkAllowedActions(action, args.token) === false) {
      log('Forbidden client action', action, args.token.allowedActions)
      return
    }

    const actionResult = {
      token: input.token,
      ...(actions[action](args) || {}),
    }
    actionResult.token = jwt.verify(actionResult.token, 'secret')

    return actionResult
  } catch (error) {
    debugger
    log('Error processing action', error)
  }
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
