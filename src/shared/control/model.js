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
  firstStart () {
  },
  increment ({amount}) {
    if (!amount) { return false }

    db.field += amount
  },
  tick () {
    mutations.increment({amount: 1})
  },
  tock ({token}) {
    token.data.tock += 1
  },
  userSession ({userName, token}) {
    if (!(userName === null || db.users.includes(userName))) {
      return false
    }

    token.data.userName = userName
    token.data.isAdmin = db.groups.find(group => group.name === 'admin').members.includes(userName)
    token.data.tock = 666
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

  let abort

  if (!(input.init === 'server' || input.init === 'client' || input.broadcasterID)) {
    abort = mutations[input.mutation](input) === false
  } else if (input.init === 'client') {
    input.token.data.tock = input.token.data.tock || Math.round(Math.random() * 1000 + 500)
  }

  return abort
    ? undefined
    : {...input, ...mapDB(db)}
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['state'],
}
