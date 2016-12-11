import {logConsole} from '../shared/logger'
import {readFileSync} from 'fs'
import http from 'spdy'
import createApp from './app'

const log = logConsole('server')

const httpOptions = {
  key: readFileSync('./tls/localhost.key'),
  cert: readFileSync('./tls/localhost.cert'),
}
const app = createApp().callback()
const server = http.createServer(httpOptions, app)

let port = Number.parseInt(process.env.PORT) || 3000
const host = process.env.HOST || 'localhost'
server.listen(port, host, () => {
  port = server.address().port
  log(`Koa listening on https://${host}:${port}`)
})
