import {logConsole} from '../../shared/boundary/logger'

const logName = 'repsonse-logger'
const log = logConsole(logName)

export default async function errorHandler (ctx, next) {
  try {
    await next()
  } catch ({status, message, stack}) {
    log('error', status || 'no status', message, stack)

    ctx.status = status || 500
    ctx.body = 'Server Error.'
  }
}
