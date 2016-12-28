import {logConsole} from '../../shared/boundary/logger'

const logName = 'response-logger'

const isJspmRequest = url =>
  url.indexOf('public/jspm_packages') !== -1 || url.indexOf('public/src')

export default async function responseLogger (ctx, next) {
  const {method, url} = ctx

  const start = new Date()
  const log = logConsole(logName, `(${method} ${url})`)
  if (!isJspmRequest(url)) {
    log('start')
  }

  await next()

  const elapsed = new Date() - start
  ctx.set('x-response-time', `${elapsed}ms`)

  if (!isJspmRequest(url)) {
    log(`end, ${elapsed}ms elapsed`)
  }
}
