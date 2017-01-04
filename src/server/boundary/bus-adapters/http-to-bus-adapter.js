import {logConsole} from '../../../shared/boundary/logger'
import getRawBody from 'raw-body'
import contentType from 'content-type'
import {toBusAdapter} from '../../../shared/boundary/connect-postal'
import {path, assocPath} from 'ramda'
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

  if (path(['session', 'clientInitToken'], ctx)) {
    const {session} = ctx
    let {clientInitToken} = session
    try {
      clientInitToken = jwt.verify(clientInitToken, 'secret')
    } catch ({message}) {
      log(message)
      ctx.status = 403
      ctx.body = {message: 'Invalid token.'}
      return
    }
    const {clientInitID} = clientInitToken
    if (!clientInitID) {
      const message = 'Missing clientInitID.'
      log(message)
      ctx.status = 403
      ctx.body = {message}
      return
    }
    data = assocPath(['data', 'arg'], clientInitID, data)
    delete session.clientInitToken
  }

  try {
    toBusAdapter({sinks: {}, logTag: logName})(data)
  } catch ({message}) {
    userErrorLog(message)
    ctx.status = 400
    ctx.body = {message}
    return
  }
  ctx.status = 200
  log('got action request body')
}
