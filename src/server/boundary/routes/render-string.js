import {logConsole} from '../../../shared/boundary/logger'
import {renderToString} from 'inferno-server'
import {pipe} from 'ramda'
import stateRepresentation, {validate} from '../../../shared/boundary/state-representation'
import {getSink} from '../../../shared/boundary/connect-postal'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {_catch} from 'rxjs/operator/catch'
import {skip} from 'rxjs/operator/skip'
import jwt from 'jsonwebtoken'

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
  <div id="root">
    <h2 style="position: absolute;right: 0;">static view</h2>
    ${html || '<h2>no view</h2>'}
  </div>
  <script>System.import('bolt_on-sam')</script>
`

let index = new BehaviorSubject(markup())::skip(1)

const actionSink = getSink({targets: ['actions'], logTag: logName})

export async function renderString (ctx) {
  const streamID = `${Math.random().toString(36).substr(2, 16)}`
  const token = jwt.sign({streamID}, 'secret', {expiresIn: '60s'})

  let sub = index
    ::_catch(error => {
      log(error)
      ctx.status = 500
      ctx.body = {message: error.message}
      sub.unsubscribe()
      sub = undefined
    })
    .subscribe(view => {
      ctx.streamID = undefined
      ctx.session.serverInitToken = token
      ctx.body = view
      sub.unsubscribe()
      sub = undefined
    })

  actionSink({action: 'initServer', token})
}

export function onStateRepresentation (input) {
  if (input.broadcasterID) { return }

  try {
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
