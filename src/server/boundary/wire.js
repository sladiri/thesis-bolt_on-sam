import Koa from 'koa'

import prettyJSON from 'koa-json'
import errorHandler from './request-error-handler'
import responseLogger from './response-logger'

import mount from 'koa-mount'

import serveFiles from './routes/serve-files'

import * as test from './routes/test'

import busToSse from './bus-adapters/bus-to-sse-adapter'
import httpToBus from './bus-adapters/http-to-bus-adapter'

import {connect} from '../../shared/boundary/connect-postal'
import createServer from './server'
import modelOptions from '../../shared/control/model'
import actionOptions from '../../shared/control/actions'
import renderStringOptions, {renderString} from './routes/render-string'

function createApp () {
  const app = new Koa()

  app.use(prettyJSON())
  app.use(errorHandler)
  app.use(responseLogger)

  app.use(mount('/public', serveFiles('/public')))

  Object.keys(test).forEach(key => {
    app.use(mount(`/test/${key}`, test[key]))
  })

  app.use(mount('/sse', busToSse(['stateRepresentation'])))
  app.use(mount('/actions', httpToBus))
  app.use(mount(renderString))

  return app
}

createServer(createApp().callback(), () => {
  connect(renderStringOptions)
  connect(modelOptions)
  connect(actionOptions)
})
