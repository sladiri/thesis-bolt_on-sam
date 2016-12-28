import {logConsole} from '../../shared/boundary/logger'

const logName = 'repsonse-logger'
const log = logConsole(logName)

export default async function errorHandler (ctx, next) {
  try {
    await next()
  } catch (err) {
    const status = err.status || 500

    log('error', status, err.message)

    ctx.status = status
    ctx.body = { message: err.message }
  }
}
