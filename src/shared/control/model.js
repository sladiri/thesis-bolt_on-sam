import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
}, log)

const db = {
  groups: [
    {name: 'admin', members: ['anton']},
    {name: 'group-A', members: ['berta', 'caesar', 'dora']},
  ],
  users: ['anton', 'berta', 'caesar', 'dora'],
}

const stuff = {
  field: 42,
}

const clone = obj => JSON.parse(JSON.stringify(obj))

/**
 * Maintains data integrity
 */
export function onPropose (input) {
  if (input.error) {
    console.log(input.error)
    debugger
  }
  const {token} = input

  if (input.init !== undefined) {
    return {stuff: clone(stuff), token, init: input.init}
  } else if (input.isBroadcast === true) {
    return {stuff: clone(stuff), token}
  } else if (token.streamID === undefined) {
    debugger
    console.log('Invalid client. TODO: Handle errors inside stream.', input)
  }

  const meta = {}
  if (token.expired) {
    debugger
    console.log('mmmmmmmmmm reset expired session')
    delete token.userName
    delete token.expired
  } else {
    if (input.increment) {
      // throw new Error('sladi model')
      stuff.field += 1
      meta.broadcast = true
    } else if (input.userName === null || db.users.includes(input.userName)) {
      token.userName = input.userName
    }
  }

  return {
    stuff: clone(stuff),
    token,
    meta,
  }
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state'],
}
