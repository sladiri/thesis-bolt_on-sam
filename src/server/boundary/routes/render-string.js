import {logConsole} from '../../../shared/boundary/logger'
import {renderToString} from 'inferno-server'
import {pipe} from 'ramda'
import stateRepresentation, {validate} from '../../../shared/boundary/state-representation'
import {getSink} from '../../../shared/boundary/connect-postal'
import jwt from 'jsonwebtoken'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {_catch} from 'rxjs/operator/catch'
import {skip} from 'rxjs/operator/skip'

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
let sub

const actionSink = getSink({targets: ['actions'], logTag: logName})

export async function renderString (ctx) {
  sub = index
    ::_catch(error => { console.log('error', logName, error) })
    .subscribe(view => {
      ctx.session.clientInitToken = jwt.sign({
        clientInitID: `${Math.random().toString(36).substr(2, 16)}`,
      }, 'secret', {expiresIn: '120s'})
      ctx.body = view
      sub.unsubscribe()
      sub = undefined
    })

  actionSink({action: 'init', arg: {server: true}})
}

export function onStateRepresentation (input) {
  pipe(
    stateRepresentation,
    renderToString,
    markup,
    ::index.next,
  )(input)

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onStateRepresentation,
}
