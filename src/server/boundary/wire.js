import {logConsole} from '../../shared/boundary/logger'

import Koa from 'koa'

import mount from 'koa-mount'
import prettyJSON from 'koa-json'
import errorHandler from './request-error-handler'
import responseLogger from './response-logger'

import serveFiles from './routes/serve-files'
import busToSse from './routes/bus-to-sse-adapter'
import httpToBus from './routes/http-to-bus-adapter'
import renderStringOptions, {renderString} from './routes/render-string'

import createServer from './server'
import {connect} from '../../shared/boundary/connect-postal'
import napOptions from '../../shared/control/nap'
import stateOptions from '../../shared/control/state'
import modelOptions from '../../shared/control/model'
import actionOptions from './actions'

const logName = 'wire-server'
const log = logConsole(logName)

function createApp () {
  const app = new Koa()

  app.use(prettyJSON())
  app.use(errorHandler)
  app.use(responseLogger)

  app.use(mount('/public', serveFiles('/public')))

  app.use(mount('/sse', busToSse(['state'])))
  app.use(mount('/actions', httpToBus))
  app.use(mount(renderString))

  return app
}

createServer(createApp().callback(), () => {
  connect(renderStringOptions)
  // connect(napOptions)
  connect(stateOptions)
  connect(modelOptions)
  connect(actionOptions)
  log('Server ready.')
})
