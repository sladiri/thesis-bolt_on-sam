import Koa from 'koa'
import errorHandler from './error_handler'
import responseLogger from './response_logger'
import serveFiles from './serve_files'
import serveFavicon from './serve_favicon'
import serveIndex from './serve_index'
import prettyJSON from 'koa-json'
import mount from 'koa-mount'
import * as test from './routes/test'

export default function createApp () {
  const app = new Koa()

  app.use(errorHandler)
  app.use(responseLogger)

  app.use(mount('/public', serveFiles('/public')))
  app.use(serveFavicon)

  app.use(prettyJSON())

  Object.keys(test).forEach(key => {
    app.use(mount(`/test/${key}`, test[key]))
  })

  app.use(mount(serveIndex))

  return app
}
