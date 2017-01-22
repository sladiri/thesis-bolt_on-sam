import {logConsole} from '../boundary/logger'
import {getSink} from '../boundary/connect-postal'
import uuid from 'uuid/v4'
import jwt from 'jsonwebtoken'

const logName = 'nap-function'
const log = logConsole(logName)

const actionSink = getSink({targets: ['actions'], logTag: logName})
const createToken = payload => jwt.sign(payload, 'secret', {expiresIn: '10s'})

export default function nap (input) {
  const actionToken = createToken({id: uuid()})
  const token = jwt.sign({data: input.token.data}, 'secret')

  if (input.mutation === 'firstStart' || input.mutation === 'tick') {
    log('tick')
    setTimeout(() => {
      actionSink({
        action: 'tick',
        actionToken,
        token,
      })
    }, 5000)
  }

  if (input.init === 'server' || input.mutation === 'tock') {
    log('tock')
    setTimeout(() => {
      actionSink({
        action: 'tock',
        actionToken,
        token: input.init === 'server' ? token : jwt.sign(input.token, 'secret'),
      })
    }, 2000)
  }

  if (['increment', 'postMessage'].includes(input.mutation)) {
    log('broadcast')
    setTimeout(() => {
      actionSink({
        action: 'broadcast',
        token: jwt.sign(input.token, 'secret'),
        actionToken,
      })
    }, 0)
  }
}
