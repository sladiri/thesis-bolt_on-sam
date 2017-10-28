import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {getSink} from '../boundary/connect-postal'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'

const logName = 'nap-function'
const log = logConsole(logName)

export const validate = validateAndLog({
  // required: ['meta'],
  // properties: {
  //   meta: {
  //     properties: {
  //       sessionId: {type: 'number'},
  //     },
  //   },
  // },
}, log)

const actionSink = getSink({targets: ['actions'], logTag: logName})
const token = input => jwt.sign(input.token, 'secret')

/*
* Pure function of the model. The response shall not depend on the stimulus.
*/
export function onNap (input) {
  // console.log('nappppp', '\n', input, '\n')
  const actions = []

  // if (input.mutation === 'tock' || input.init === 'client' && !input.token.data.cached) {
  //   setTimeout(() => {
  //     actionSink({
  //       directedBroadcast: true,
  //       action: 'tock',
  //       token: token(input),
  //     })
  //   }, 666)
  // }

  // if (['tick', 'increment', 'postMessage'].includes(input.mutation)) {
  //   console.log('gonna broadcast')
  //   setTimeout(() => {
  //     console.log('broadcast')
  //     actionSink({
  //       action: 'broadcast',
  //       token: token(input),
  //     })
  //   }, 1000)
  // }

  return actions
}

export default {
  topics: ['nap'],
  logTag: logName,
  validate,
  handler: onNap,
  // targets: ['action'],
}
