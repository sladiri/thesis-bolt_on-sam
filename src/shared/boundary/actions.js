export const actions = {
  incrementField ({arg}) {
    return {mutation: 'increment', amount: arg || 1}
  },
  tick () {
    return {mutation: 'tick', broadcasterID: null}
  },
  tock () {
    return {mutation: 'tock'}
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
