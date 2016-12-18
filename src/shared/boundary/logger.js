/* global localStorage */

import logger from 'debug'
import env from '../../client/boundary/env'

const appPrefix = ['TBO']

function setBrowserDebugLevel () {
  if (typeof window === 'undefined') { return }
  localStorage.debug = `${env.debug}`
}

function appLog (prefixes) {
  setBrowserDebugLevel()
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
