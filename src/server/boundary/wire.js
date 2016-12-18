import Koa from 'koa'
import errorHandler from './request-error-handler'
import responseLogger from './response-logger'
import serveFiles from './routes/serve-files'
import serveFavicon from './routes/serve-favicon'
import renderIndexOptions, {renderIndex} from './routes/render-index'
import prettyJSON from 'koa-json'
import mount from 'koa-mount'
import * as test from './routes/test'

import createServer from './server'

import {connect, getSink} from '../../shared/boundary/connect-postal'
import busToSse from './bus-to-sse-adapter'

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

  app.use(mount(renderIndex))

  return app
}

createServer(createApp().callback(), () => {
  connect(renderIndexOptions)
  getSink({targets: ['stateRepresentation']})({
    model: {field: 42},
  })

  let i = 0
  setInterval(() => {
    getSink({targets: ['stateRepresentation']})({
      model: {field: 666 + i++},
    })
  }, 2000)
})
