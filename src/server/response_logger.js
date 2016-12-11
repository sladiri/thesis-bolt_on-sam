import {logConsole} from '../shared/logger'

const log = logConsole('http')

export default async function responseLogger (ctx, next) {
  const start = new Date()

  await next()

  const elapsed = new Date() - start
  ctx.set('X-Response-Time', `${elapsed}ms`)

  if (!ctx.url.startsWith('/public/jspm_packages')) {
    log(`${ctx.method} ${ctx.url} ; ${elapsed}ms elapsed`)
  }
}
