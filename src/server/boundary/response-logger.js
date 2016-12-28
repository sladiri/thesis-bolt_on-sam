import {logConsole} from '../../shared/boundary/logger'

const logName = 'response-logger'

export default async function responseLogger (ctx, next) {
  const {method, url} = ctx

  const start = new Date()
  const log = logConsole(logName, `(${method} ${url})`)
  log('start')

  await next()

  const elapsed = new Date() - start
  ctx.set('X-Response-Time', `${elapsed}ms`)

  if (!url.startsWith('/public/jspm_packages')) {
    log(`end, ${elapsed}ms elapsed`)
  }
}
