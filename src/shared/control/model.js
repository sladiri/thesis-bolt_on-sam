import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['meta'],
  properties: {
    meta: {
      properties: {
        secret: {type: 'string'},
      },
    },
  },
}, log)

const db = {
  groups: [
    {name: 'admin', members: ['anton']},
    {name: 'group-A', members: ['berta', 'caesar', 'dora']},
  ],
  users: ['anton', 'berta', 'caesar', 'dora'],
}

const model = {
  field: 42,
  userName: null,
}

/**
 * Maintains data integrity
 */
export function onPropose (input) {
  if (input.increment) {
    model.field += 1
  }

  if (input.userName === null) {
    model.userName = input.userName
  }
  if (db.users.includes(input.userName)) {
    model.userName = input.userName
  }

  return {
    ...input,
    model: {
      ...model,
      id: input.meta.sessionId,
    },
  }
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state'],
}
