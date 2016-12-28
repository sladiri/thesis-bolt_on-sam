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

export async function renderString (ctx) {
  let killer = flyd.stream()
  let stream = takeUntil(index, killer)
  flyd.on(view => {
    ctx.body = view
    killer(true)
    killer = undefined
    stream = undefined
  }, stream)

  getSink({targets: ['propose'], logTag: logName})(null)
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
