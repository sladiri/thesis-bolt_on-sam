import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
}, log)

const clone = obj => JSON.parse(JSON.stringify(obj))

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

const mutations = {
  increment ({amount}) {
    if (!amount) {
      return {noOp: true}
    }
    stuff.field += amount
    return {broadcast: true}
  },
  userSession ({userName, token}) {
    if (!(userName === null || db.users.includes(userName))) {
      return {noOp: true}
    }
    token.userName = userName
  },
}

/**
 * Maintains data integrity
 */
export function onPropose (input) {
  if (input.error) {
    return input
  }

  if (input.init === 'server' || input.init === 'client') {
    return {...input, stuff: clone(stuff)}
  }

  if (input.broadcasterID) {
    return {...input, stuff: clone(stuff)}
  }

  const options = mutations[input.mutation](input) || {}

  return {...input, ...options, stuff: clone(stuff)}
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state'],
}
