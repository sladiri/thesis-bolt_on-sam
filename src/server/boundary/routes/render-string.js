import {logConsole} from '../../../shared/boundary/logger'
import {renderToString} from 'inferno-server'
import {pipe, path, tap, when, isNil} from 'ramda'
import stateRepresentation, {validate} from '../../../shared/boundary/state-representation'
import {getSink} from '../../../shared/boundary/connect-postal'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {_catch} from 'rxjs/operator/catch'
import {_do} from 'rxjs/operator/do'
import {first} from 'rxjs/operator/first'
import {skip} from 'rxjs/operator/skip'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'

const logName = 'render-index'
const log = logConsole(logName)

const markup = html =>
`
<!doctype html>
<html lang=en>
<head>
  <meta charset=utf-8>
  <title>Bolt On - SAM!</title>
  <link rel="icon" href="/public/favicon.ico" />
  <script src="/public/jspm_packages/system.js"></script>
  <script src="/public/jspm.config.js"></script>
  <script src="/public/dist/bundle.js"></script>
  <!--<link rel="stylesheet" type="text/css" href="dist/main.css">-->
</head>
<body>
  ${html}
  <script>System.import('bolt_on-sam')</script>
`

let index = new BehaviorSubject(markup())::skip(1)

const actionSink = getSink({targets: ['actions'], logTag: logName})

const cache = {}

const createToken = payload => jwt.sign(payload, 'secret', {expiresIn: '100s'})

export async function renderString (ctx) {
  // TODO store more in initToken than just streamID, to identify client
  // const oldID = ctx.session.streamID

  // if (oldID && cache[oldID]) {
  //   log('Restore input data', oldID)
  //   try {
  //     ctx.session.failedCache = false
  //     ctx.session.serverInitToken = createToken({data: {streamID: oldID}})
  //     ctx.body = cache[oldID]
  //   } catch (error) {
  //     log(error)
  //     ctx.status = 500
  //     ctx.body = {message: error.message}
  //   }
  //   return
  // } else if (oldID && !cache[oldID]) {
  //   log('Missing input data cache', oldID)
  // }

  const token = createToken({
    data: {
      streamID: uuid(),
      failedCache: true,
    },
  })

  index
    ::first()
    ::_do(view => {
      ctx.set('set-cookie', token)
      ctx.body = view
    })
    ::_catch(error => {
      log(error)
      ctx.status = 500
      ctx.body = {message: error.message}
    })
    .subscribe()

  actionSink({action: 'initServer', token})
}

export function onStateRepresentation (input) {
  try {
    const streamID = path(['token', 'data', 'streamID'], input)
    when(
      input => isNil(input.broadcasterID),
      pipe(
        stateRepresentation,
        renderToString,
        markup,
        tap(string => { cache[streamID] = string }),
        ::index.next,
        tap(() => { log(`rendered and cached by streamID [${streamID}] - cache length [${Object.keys(cache).length}]`) })
      )
    )(input)
  } catch (error) {
    index.error(error)
  }
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onStateRepresentation,
}

// const tickerStreamID = uuid()
// setInterval(() => {
// // setTimeout(() => {
//   console.log('tick')
//   const token = createToken({data: {streamID: tickerStreamID, allowedActions: ['tick']}})
//   // actionSink({action: 'tick', token})
//   actionSink(({action: 'initClient', savedToken: null}))
// // }, 1500)
// }, 1000)
