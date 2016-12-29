import {logConsole} from '../../../shared/boundary/logger'
import {renderToString} from 'inferno-server'
import flyd from 'flyd'
import takeUntil from 'flyd/module/takeuntil'
import {pipe} from 'ramda'
import stateRepresentation, {validate} from '../../../shared/boundary/state-representation'
import {getSink} from '../../../shared/boundary/connect-postal'

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

const index = flyd.stream()
const actionSink = getSink({targets: ['actions'], logTag: logName})

export async function renderString (ctx) {
  ctx.session.foo = ctx.session.foo || 1
  ctx.session.foo += 1
  log('|||||||||||||||||||||||||| ========================= sess', JSON.stringify(ctx.session))

  let killer = flyd.stream()
  let stream = takeUntil(index, killer)
  flyd.on(view => {
    ctx.body = view
    killer(true)
    killer = undefined
    stream = undefined
  }, stream)

  actionSink({meta: {}})
}

export function onStateRepresentation (input) {
  pipe(
    stateRepresentation,
    renderToString,
    markup,
    index,
  )(input)

  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  logTag: logName,
  validate,
  handler: onStateRepresentation,
}
