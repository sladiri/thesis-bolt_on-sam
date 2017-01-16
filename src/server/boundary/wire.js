import {logConsole} from '../../shared/boundary/logger'

import Koa from 'koa'
import convert from 'koa-convert'

import prettyJSON from 'koa-json'
import errorHandler from './request-error-handler'
import responseLogger from './response-logger'

import mount from 'koa-mount'

import session from 'koa-session'
import serveFiles from './routes/serve-files'

import * as test from './routes/test'

import busToSse from './bus-adapters/bus-to-sse-adapter'
import httpToBus from './bus-adapters/http-to-bus-adapter'

import createServer from './server'

import {connect} from '../../shared/boundary/connect-postal'
import actionOptions from '../../shared/boundary/actions'
import modelOptions from '../../shared/control/model'
import stateOptions from '../../shared/control/state'
import renderStringOptions, {renderString} from './routes/render-string'

const logName = 'wire-server'
const log = logConsole(logName)

function createApp () {
  const app = new Koa()

  app.use(prettyJSON())
  app.use(errorHandler)
  app.use(responseLogger)

  app.use(mount('/public', serveFiles('/public')))

  Object.keys(test).forEach(key => {
    app.use(mount(`/test/${key}`, test[key]))
  })

  app.keys = ['secret']
  app.use(convert(session({
    key: 't-bos:sess', /** (string) cookie key (default is koa:sess) */
    maxAge: 1000 * 60 * 60 * 24, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: false, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
  }, app)))

  app.use(mount('/sse', busToSse(['state'])))
  app.use(mount('/actions', httpToBus))
  app.use(mount(renderString))

  return app
}

createServer(createApp().callback(), () => {
  log('Server ready.')

  connect(renderStringOptions)
  connect(stateOptions)
  connect(modelOptions)
  connect(actionOptions)
})
