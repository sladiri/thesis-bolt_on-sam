import {logConsole} from '../../shared/boundary/logger'
import {readFileSync} from 'fs'
import http from 'spdy'

const logName = 'server'
const log = logConsole(logName)

export default function createServer (app, callback) {
  const httpOptions = {
    key: readFileSync('./tls/localhost.key'),
    cert: readFileSync('./tls/localhost.cert'),
  }
  const server = http.createServer(httpOptions, app)

  let port = Number.parseInt(process.env.PORT) || 3000
  const host = process.env.HOST || 'localhost'
  server.listen(port, host, () => {
    port = server.address().port
    log(`Koa listening on https://${host}:${port}`)
    callback()
  })
}
