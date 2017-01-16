import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
}, log)

const clone = obj => JSON.parse(JSON.stringify(obj))

const db = {
  field: 42,
  groups: [
    {name: 'admin', members: ['anton'], posts: []},
    {name: 'group-A', members: ['berta', 'caesar', 'dora'], posts: []},
  ],
  users: ['anton', 'berta', 'caesar', 'dora'],
}

const mapDB = db =>
  ({
    model: clone({
      field: db.field,
      groups: db.groups,
    }),
  })

const mutations = {
  increment ({amount}) {
    if (!amount) { return {noOp: true} }

    db.field += amount
    return {broadcast: true}
  },
  userSession ({userName, token}) {
    if (!(userName === null || db.users.includes(userName))) {
      return {noOp: true}
    }

    token.data.userName = userName
  },
  postMessage ({group: groupName, message, token}) {
    let group
    if (!(group = db.groups.find(group => group.name === groupName))) {
      return {noOp: true}
    }

    group.posts.push(message)
    return {broadcast: true}
  },
}

/**
 * Maintains data integrity
 */
export function onPropose (input) {
  if (input.error) { return input }

  if (input.init === 'server' || input.init === 'client' || input.broadcasterID) {
    return {...input, ...mapDB(db)}
  }

  const options = mutations[input.mutation](input) || {}

  return {token: input.token, ...options, ...mapDB(db)}
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state'],
}
