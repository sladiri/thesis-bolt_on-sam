import {logConsole} from '../../../shared/boundary/logger'
import getRawBody from 'raw-body'
import contentType from 'content-type'
import {toBusAdapter} from '../../../shared/boundary/connect-postal'

const logName = 'http-to-bus-adapter'
const log = logConsole(logName)

export default async function httpToBusAdapter (ctx) {
  const encoding = contentType.parse(ctx.req).parameters.charset
  if (!encoding) {
    log('missing encoding')
    ctx.status = 400
    return
  }

  const body = await getRawBody(ctx.req, {
    length: ctx.req.headers['content-length'],
    limit: '1mb',
    encoding,
  })
  log('got body', body)

  const toBus = toBusAdapter({sinks: {}, logTag: logName})
  toBus(body)
  ctx.status = 200
}
