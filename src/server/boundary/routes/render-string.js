import {logConsole} from '../../../shared/boundary/logger'
import {renderToString} from 'inferno-server'
import {pipe, path} from 'ramda'
import stateRepresentation, {validate} from '../../../shared/boundary/state-representation'
import {getSink} from '../../../shared/boundary/connect-postal'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {_catch} from 'rxjs/operator/catch'
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
  <meta charset=utf-8><title>Bolt On - SAM!</title>
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
const saveInput = input => {
  const streamID = path(['token', 'data', 'streamID'], input)
  log('Cache input data.', streamID)
  if (streamID) {
    cache[streamID] = input // TODO limit memory usage
  }
}

const createToken = payload => jwt.sign(payload, 'secret', {expiresIn: '60s'})

export async function renderString (ctx) {
  // TODO store more in initToken than just streamID, to identify client
  const oldID = ctx.session.streamID
  const initActionID = uuid()

  if (oldID && cache[oldID]) {
    log('Restore input data', oldID)
    try {
      ctx.session.failedCache = false
      ctx.session.serverInitToken = createToken({data: {streamID: oldID}})
      ctx.session.actionToken = createToken({id: initActionID})
      ctx.body = pipe(
        stateRepresentation,
        renderToString,
        markup,
      )(cache[oldID])
    } catch (error) {
      log(error)
      ctx.status = 500
      ctx.body = {message: error.message}
    }
    return
  } else if (oldID && !cache[oldID]) {
    log('Missing input data cache', oldID)
  }

  const streamID = uuid()
  const token = createToken({data: {streamID}})
  const actionToken = createToken({id: initActionID})

  let sub = index // TODO just take value
    ::_catch(error => {
      log(error)
      ctx.status = 500
      ctx.body = {message: error.message}
      sub.unsubscribe()
      sub = undefined
    })
    .subscribe(view => {
      ctx.session.failedCache = true
      ctx.session.serverInitToken = token
      ctx.session.actionToken = actionToken
      ctx.session.streamID = streamID
      ctx.body = view
      sub.unsubscribe()
      sub = undefined
    })

  actionSink({action: 'initServer', token, actionToken})
}

export function onStateRepresentation (input) {
  try {
    if (input.broadcasterID) { return }

    saveInput(input)

    pipe(
      stateRepresentation,
      renderToString,
      markup,
      ::index.next,
    )(input)
  } catch (error) {
    index.error(error)
  }

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onStateRepresentation,
}
