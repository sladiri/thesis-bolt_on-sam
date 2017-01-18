import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['token', 'action'],
  properties: {
    action: {
      enum: [
        'initServer',
        'initClient',
        'incrementField',
        'userSession',
        'broadcast',
        'groupMessage',
        'toggleGroup',
      ],
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
  initClient ({token, savedToken, failedCache}) {
    const initToken = jwt.verify(token, 'secret')
    const streamID = initToken.data.streamID

    if (failedCache) {
      log('Initclient - failed cache.')
      return {init: 'client', token: jwt.sign({data: {streamID}}, 'secret', {expiresIn: '1y'})}
    }

    let oldData = {}
    if (savedToken) {
      try {
        oldData = jwt.verify(savedToken, 'secret').data || oldData
        log('Initclient - reuse old data.')
      } catch (error) {
        log('Initclient - expired old token', error)
      }
    }
    const newData = {...oldData, streamID}
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
  toggleGroup ({arg: {group, user}}) {
    return {mutation: 'toggleGroup', group, user}
  },
}

/**
 * - Context specifiic logic (eg. set default value)
 * - Calls external API (eg. validation service)
*/
export function onAction (input) {
  try {
    const {action} = input

    jwt.verify(input.actionToken, 'secret') // TODO blcaklist used tokens
    input.actionToken = jwt.sign({id: uuid()}, 'secret', {expiresIn: '1y'})

    log('Action intent', action)

    if (checkAllowedActions(action, input.token) === false) {
      log('Forbidden client action', action, input.token.allowedActions)
      return
    }

    const actionResult = {
      token: input.token,
      actionToken: input.actionToken,
      ...(actions[action](input) || {}),
    }
    actionResult.token = jwt.verify(actionResult.token, 'secret')

    return actionResult
  } catch (error) {
    log('Error processing action', error)
    return {error}
  }
}

export default {
  topics: ['actions'],
  logTag: logName,
  validate,
  handler: onAction,
  targets: ['propose'],
}
