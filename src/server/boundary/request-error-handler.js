import {logConsole} from '../../shared/boundary/logger'

const logName = 'repsonse-logger'
const log = logConsole(logName)

export default async function errorHandler (ctx, next) {
  try {
    await next()
  } catch ({status = 500, message}) {
    log('error', status, message)

    ctx.status = status
    ctx.body = { message }
  }
}
