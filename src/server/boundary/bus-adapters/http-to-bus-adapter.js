import {logConsole} from '../../../shared/boundary/logger'
import getRawBody from 'raw-body'
import contentType from 'content-type'
import {toBusAdapter} from '../../../shared/boundary/connect-postal'

const logName = 'http-to-bus-adapter'
const log = logConsole(logName)

export default async function httpToBusAdapter (ctx) {
  const {req} = ctx
  let encoding

  try {
    encoding = contentType.parse(req).parameters.charset
  } catch ({message}) {
    log(message)
    ctx.status = 400
    ctx.body = {message}
    return
  }

  if (!encoding) {
    const message = 'Encoding parameter is required.'
    log(message)
    ctx.status = 400
    ctx.body = {message}
    return
  }

  const body = await getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding,
  })

  if (body) {
    log('got request body', body)
    const toBus = toBusAdapter({sinks: {}, logTag: logName})
    toBus(body)
  }

  ctx.status = 200
}
