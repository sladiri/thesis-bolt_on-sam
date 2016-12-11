import logger from 'debug'

const appPrefix = ['[T-BO]']
const appLog = (prefixes) => {
  const prefix = appPrefix.concat(prefixes).join(':')
  return typeof window === 'undefined' // JSPM has error when localstorage.debug is set for 'debug'.
    ? logger(prefix)
    : message => { console.log(`${prefix} ${message}`) }
}

export function format (messages) {
  return `:: ${messages.join(', ')}`
}

export const logConsole = (...prefixes) => {
  const log = appLog(prefixes)
  return function logConsole (...messages) {
    return log(format(messages))
  }
}
