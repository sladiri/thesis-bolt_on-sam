import logger from 'debug'

const appPrefix = ['[T-BO]']
const appLog = (prefixes) => {
  const prefix = appPrefix.concat(prefixes).join(':')
  return logger(prefix)
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
