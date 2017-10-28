import {logConsole} from '../../../shared/boundary/logger'
import getRawBody from 'raw-body'
import contentType from 'content-type'
import {toBusAdapter} from '../../../shared/boundary/connect-postal'
import {assocPath} from 'ramda'

const logName = 'http-to-bus-adapter'
const log = logConsole(logName)
const userErrorLog = logConsole(logName, 'user-error')

// setTimeout(() => {
//   postal.publish({channel: 't_bo-sam', topic: 'actions', data: {action: 'fucker'}})
// }, 2000)


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

  // console.log('http', ctx.session)
  // const serverInitToken = ctx.session.serverInitToken
  // const failedCache = ctx.session.failedCache
  // if (serverInitToken) {
  //   delete ctx.session.serverInitToken
  //   delete ctx.session.failedCache
  //   data = assocPath(['data', 'token'], serverInitToken, data)
  //   data = assocPath(['data', 'failedCache'], failedCache, data)
  // }

  try {
    log('got action request body')

    data = assocPath(['data', 'data', 'cookie'], ctx.get('cookie'), data)
    data = assocPath(['envelope', 'data', 'cookie'], ctx.get('cookie'), data)
    data = assocPath(['envelope', 'topic'], 'actions', data)
    toBusAdapter({sinks: {}, logTag: logName})(data)
  } catch (e) {
    console.log(e)
    debugger
  }
  ctx.status = 200
}
