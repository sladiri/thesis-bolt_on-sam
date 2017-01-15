import {logConsole} from '../../../shared/boundary/logger'
import getRawBody from 'raw-body'
import contentType from 'content-type'
import {toBusAdapter} from '../../../shared/boundary/connect-postal'
import {assocPath} from 'ramda'
import jwt from 'jsonwebtoken'

const logName = 'http-to-bus-adapter'
const log = logConsole(logName)
const userErrorLog = logConsole(logName, 'user-error')

export default async function httpToBusAdapter (ctx) {
  const {req} = ctx

  let encoding

  try {
    encoding = contentType.parse(req).parameters.charset
  } catch ({message}) {
    userErrorLog(message)
    ctx.status = 400
    ctx.body = {message: 'Invalid HTTP charset parameter.'}
    return
  }

  if (!encoding) {
    const message = 'Encoding parameter is required.'
    userErrorLog(message)
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
    userErrorLog(message)
    ctx.status = 400
    ctx.body = {message: 'Invalid JSON in body.'}
    return
  }

  const token = ctx.session.serverInitToken
  if (token) {
    delete ctx.session.serverInitToken
    data = assocPath(['data', 'token'], token, data)
  }

  log('got action request body')

  toBusAdapter({sinks: {}, logTag: logName})(data)

  ctx.status = 200
}
