import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
}, log)

const clone = obj => JSON.parse(JSON.stringify(obj))

const db = {
  ticker: 1,
  field: 42,
  groups: [
    {name: 'admin', members: ['anton', 'berta'], posts: []},
    {name: 'group-A', members: ['admin', 'berta', 'caesar', 'dora'], posts: []},
  ],
  users: ['anton', 'berta', 'caesar', 'dora'],
}

const mutations = {
  tick () {
    db.ticker += 1
  },
  increment ({amount}) {
    if (!amount) { return false }

    db.field += amount
  },
  tock ({token}) {
    token.data.tock += 1
    return {path: ['tock']}
  },
  userSession ({userName, token}) {
    if (!(userName === null || db.users.includes(userName))) {
      return false
    }

    token.data.userName = userName
    token.data.isAdmin = db.groups.find(group => group.name === 'admin').members.includes(userName)
  },
  postMessage ({group: groupName, message, token}) {
    let group
    if (!(group = db.groups.find(group => group.name === groupName))) {
      return false
    }

    group.posts.push(message)
  },
  toggleGroup ({group: groupName, user: userName, token}) {
    let group
    if (
      !token.data.isAdmin ||
      !(group = db.groups.find(group => group.name === groupName)) ||
      !db.users.includes(userName)
    ) {
      return false
    }
    const memberIndex = group.members.indexOf(userName)
    if (memberIndex >= 0) {
      group.members.splice(memberIndex, 1)
    } else {
      group.members.push(userName)
    }
  },
}

/**
 * Maintains data integrity
 */
export function onPropose (input) {
  if (input.error) { return input }

  let hint

  if (!(input.init === 'server' || input.init === 'client' || input.broadcasterID)) {
    hint = mutations[input.mutation](input)
  } else if (input.init === 'client') {
    input.token.data.tock = input.token.data.tock || Math.round(Math.random() * 1000 + 500)
  }

  return hint === false
    ? undefined
    : {...input, ...hint, model: clone(db)}
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state', 'nap'],
}
