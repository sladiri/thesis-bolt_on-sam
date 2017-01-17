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
  ${
    html ||
    '<div id="state-representation"><h2 style="position: absolute;right: 0;">static view</h2><h2>no view</h2></div>'
  }
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

export async function renderString (ctx) {
  // TODO store more in initToken than just streamID, to identify client
  const oldID = ctx.session.streamID

  if (oldID && cache[oldID]) {
    log('Restore input data', oldID)
    try {
      ctx.session.failedCache = false
      ctx.session.serverInitToken = jwt.sign({data: {streamID: oldID}}, 'secret', {expiresIn: '60s'})
      ctx.session.actionToken = jwt.sign({id: uuid()}, 'secret', {expiresIn: '60s'})
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
  const token = jwt.sign({data: {streamID}}, 'secret', {expiresIn: '60s'})
  const actionToken = jwt.sign({id: uuid()}, 'secret', {expiresIn: '60s'})

  let sub = index
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
