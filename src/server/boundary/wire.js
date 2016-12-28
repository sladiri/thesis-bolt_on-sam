import Koa from 'koa'
import errorHandler from './request-error-handler'
import responseLogger from './response-logger'
import serveFiles from './routes/serve-files'
import renderStringOptions, {renderString} from './routes/render-string'
import prettyJSON from 'koa-json'
import mount from 'koa-mount'
import * as test from './routes/test'

import busToSse from './bus-adapters/bus-to-sse-adapter'
import httpToBus from './bus-adapters/http-to-bus-adapter'

import createServer from './server'
import modelOptions from '../../shared/control/model'
import {connect} from '../../shared/boundary/connect-postal'

function createApp () {
  const app = new Koa()

  app.use(errorHandler)
  app.use(responseLogger)
  app.use(mount('/public', serveFiles('/public')))
  app.use(prettyJSON())
  Object.keys(test).forEach(key => {
    app.use(mount(`/test/${key}`, test[key]))
  })
  app.use(mount('/actions', httpToBus))
  app.use(mount('/sse', busToSse(['stateRepresentation'])))
  app.use(mount(renderString))

  return app
}

createServer(createApp().callback(), () => {
  connect(renderStringOptions)
  connect(modelOptions)
})
