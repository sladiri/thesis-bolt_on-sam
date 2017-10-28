import {logConsole} from '../../shared/boundary/logger'
import validateAndLog from '../../shared/boundary/json-schema'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'
import {actions as sharedActions} from '../../shared/boundary/actions'

const logName = 'actions'
const log = logConsole(logName)

export const validate = validateAndLog({
  // required: ['token', 'action'],
  // properties: {
  //   action: {
  //     enum: [
  //       'initServer',
  //       'initClient',
  //       'incrementField',
  //       'tick',
  //       'tock',
  //       'userSession',
  //       'broadcast',
  //       'groupMessage',
  //       'toggleGroup',
  //     ],
  //   },
  // },
}, log)

const checkAllowedActions = (action, token) => {
  if (!(action === 'initServer' || action === 'initClient' || action === 'broadcast')) {
    const {data: {allowedActions}} = jwt.verify(token, 'secret')
    if (!allowedActions.includes(action)) {
      return false
    }
  }
}

export const actions = {
  initServer ({token}) {
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
    const newData = {...oldData, streamID, cached: true}
    return {init: 'client', token: jwt.sign({data: newData}, 'secret', {expiresIn: '1y'})}
  },
  broadcast ({token}) {
    const {data: {streamID}} = jwt.verify(token, 'secret')
    return {broadcasterID: streamID}
  },
  ...sharedActions,
}

/**
 * - Context specifiic logic (eg. set default value)
 * - Calls external API (eg. validation service)
*/
export function onAction (input) {
  console.log('ac\n', input)
  try {
    const {action} = input

    log('Action intent', action)

    if (checkAllowedActions(action, input.token) === false) {
      log('Forbidden client action', action, input.token.allowedActions)
      return
    }

    const actionResult = {
      directedBroadcast: input.directedBroadcast,
      token: input.token,
      ...(actions[action](input) || {}),
    }
    actionResult.token = jwt.verify(actionResult.token, 'secret')

    return actionResult
  } catch (error) {
    console.log('Error processing action', input, error)
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
