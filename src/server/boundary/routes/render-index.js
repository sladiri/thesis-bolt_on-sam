import {logConsole} from '../../../shared/boundary/logger'
import flyd from 'flyd'
import stateRepresentation, {validate} from '../../../shared/boundary/state-representation'

const log = logConsole('render-index')

const markup = html =>
`
<!doctype html>
<html lang=en>
<head>
  <meta charset=utf-8><title>Bolt On - SAM!</title>
  <script src="/public/jspm_packages/system.js"></script>
  <script src="/public/jspm.config.js"></script>
  <!--<link rel="stylesheet" type="text/css" href="dist/main.css">-->
</head>
<body>
  <div id="root">
    <h2>static view</h2>
    ${html || '<h2>no view</h2>'}
  </div>
  <script>
    console.log('index there')
    Promise.all([
      System.import('bolt_on-sam'),
    ])
  </script>
`

let index = flyd.stream()

export async function renderIndex (ctx) {
  ctx.body = index()
}

export function onServerStateRepresentation (input) {
  const view = stateRepresentation({model: input.model})
  index(markup(view.outerHTML))
  log('rendered')
}

export default {
  topics: ['stateRepresentation'],
  validate,
  handler: onServerStateRepresentation,
}
