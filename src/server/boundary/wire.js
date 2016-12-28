import Koa from 'koa'
import errorHandler from './request-error-handler'
import responseLogger from './response-logger'
import serveFiles from './routes/serve-files'
import renderIndexOptions, {renderIndex} from './routes/render-index'
import prettyJSON from 'koa-json'
import mount from 'koa-mount'
import * as test from './routes/test'

import createServer from './server'

import {connect, getSink} from '../../shared/boundary/connect-postal'
import busToSse from './bus-adapters/bus-to-sse-adapter'
import httpToBus from './bus-adapters/http-to-bus-adapter'

import modelOptions from '../../shared/control/model'

function createApp () {
  const app = new Koa()

  app.use(errorHandler)
  app.use(responseLogger)
  app.use(mount('/public', serveFiles('/public')))
  app.use(prettyJSON())
  Object.keys(test).forEach(key => {
    app.use(mount(`/test/${key}`, test[key]))
  })
  app.use(mount('/sse', busToSse))
  app.use(mount('/actions', httpToBus))
  app.use(mount(renderIndex))

  return app
}

createServer(createApp().callback(), () => {
  connect(renderIndexOptions)
  connect(modelOptions)
  getSink({targets: ['propose']})(null)

  setInterval(() => {
    getSink({targets: ['propose']})(null)
  }, 20000)
})
