import {logConsole} from '../../../shared/boundary/logger'
import getRawBody from 'raw-body'
import contentType from 'content-type'
import {toBusAdapter} from '../../../shared/boundary/connect-postal'
import {assocPath, pipe} from 'ramda'

const logName = 'http-to-bus-adapter'
const log = logConsole(logName)

export default async function httpToBusAdapter (ctx) {
  const sessionId = ctx.session.id
  if (!sessionId) {
    const message = 'Session is required.'
    log(message)
    ctx.status = 400
    ctx.body = {message}
    return
  }

  const {req} = ctx
  let encoding

  try {
    encoding = contentType.parse(req).parameters.charset
  } catch ({message}) {
    log(message)
    ctx.status = 400
    ctx.body = {message: 'Invalid HTTP charset parameter.'}
    return
  }

  if (!encoding) {
    const message = 'Encoding parameter is required.'
    log(message)
    ctx.status = 400
    ctx.body = {message}
    return
  }

  let data
  try {
    const body = await getRawBody(req, {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding,
    })
    data = JSON.parse(body)
  } catch ({message}) {
    log(message)
    ctx.status = 400
    ctx.body = {message: 'Invalid JSON in body.'}
    return
  }

  try {
    pipe(
      assocPath(['data', 'meta', 'sessionId'], sessionId),
      toBusAdapter({sinks: {}, logTag: logName}),
    )(data)
  } catch ({message}) {
    log(message)
    ctx.status = 400
    ctx.body = {message}
    return
  }
  ctx.status = 200
  log(`got request body from ${sessionId}`)
}
