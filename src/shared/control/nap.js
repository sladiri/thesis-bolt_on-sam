import {logConsole} from '../boundary/logger'
import {getSink} from '../boundary/connect-postal'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'

const logName = 'nap-function'
const log = logConsole(logName)

const actionSink = getSink({targets: ['actions'], logTag: logName})
const actionToken = () => jwt.sign({id: uuid()}, 'secret', {expiresIn: '10s'})
const token = input => jwt.sign(input.token, 'secret')

export default function nap (input) {
  if (input.mutation === 'firstStart' || input.mutation === 'tick') {
    setTimeout(() => {
      actionSink({
        action: 'tick',
        actionToken: actionToken(),
        token: token(input),
      })
    }, 1000)
  }

  if (input.mutation === 'tock' || input.init === 'client' && !input.token.data.cached) {
    setTimeout(() => {
      actionSink({
        action: 'tock',
        actionToken: actionToken(),
        token: token(input),
      })
    }, 666)
  }

  if (['increment', 'postMessage'].includes(input.mutation)) {
    log('broadcast')
    setTimeout(() => {
      actionSink({
        action: 'broadcast',
        actionToken: actionToken(),
        token: token(input),
      })
    }, 0)
  }
}
