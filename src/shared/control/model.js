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
    {name: 'admin', members: ['anton', 'berta'], posts: []},
    {name: 'group-A', members: ['admin', 'berta', 'caesar', 'dora'], posts: []},
  ],
  users: ['anton', 'berta', 'caesar', 'dora'],
}

const mapDB = db =>
  ({
    model: clone({
      field: db.field,
      groups: db.groups,
      users: db.users,
    }),
  })

const mutations = {
  increment ({amount, mutation}) {
    if (!amount) { return {noOp: true} }

    db.field += amount
    return {broadcast: true, broadcastAction: mutation}
  },
  userSession ({userName, token}) {
    if (!(userName === null || db.users.includes(userName))) {
      return {noOp: true}
    }

    token.data.userName = userName
    token.data.isAdmin = db.groups.find(group => group.name === 'admin').members.includes(userName)
  },
  postMessage ({group: groupName, message, token}) {
    let group
    if (!(group = db.groups.find(group => group.name === groupName))) {
      return {noOp: true}
    }

    group.posts.push(message)
    return {broadcast: true}
  },
  toggleGroup ({group: groupName, user: userName, token}) {
    let group
    if (
      !token.data.isAdmin ||
      !(group = db.groups.find(group => group.name === groupName)) ||
      !db.users.includes(userName)
    ) {
      return {noOp: true}
    }
    const memberIndex = group.members.indexOf(userName)
    if (memberIndex >= 0) {
      group.members.splice(memberIndex, 1)
    } else {
      group.members.push(userName)
    }
    // return {broadcast: true}
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

  return {...input, ...options, ...mapDB(db)}
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state'],
}
