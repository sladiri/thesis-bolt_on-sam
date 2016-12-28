import {logConsole} from '../../shared/boundary/logger'

const logName = 'repsonse-logger'
const log = logConsole(logName)

export default async function responseLogger ({set, url, method}, next) {
  const start = new Date()

  await next()

  const elapsed = new Date() - start
  set('X-Response-Time', `${elapsed}ms`)

  if (!url.startsWith('/public/jspm_packages')) {
    log(`${method} ${url} ; ${elapsed}ms elapsed`)
  }
}
