import {readFileSync} from 'fs'
import server from 'spdy'
import createApp from './app'

const httpOptions = {
  key: readFileSync('./tls/localhost.key'),
  cert: readFileSync('./tls/localhost.cert'),
}
const app = createApp().callback()
server.createServer(httpOptions, app).listen(3000, () => {
  console.log('Koa listening on https://localhost:3000')
})
