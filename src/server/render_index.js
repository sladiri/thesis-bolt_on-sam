import {logConsole} from '../shared/logger'
import validate from '../shared/json_schema'

const log = logConsole('render_dom')

const index = html =>
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
  <div id="root">${html || '<h2>no view</h2>'}</div>
  <script>
    Promise.all([
      System.import('bolt_on-sam'),
    ])
  </script>
`

let view = index()

export default async function renderIndex (ctx) {
  ctx.body = view
}

const validInput = validate({
  properties: {
    node: {
      properties: {
        outerHTML: {type: 'string'},
      },
    },
  },
}, log)

export function onRender (input) {
  if (!validInput(input)) { return }

  view = index(input.node.outerHTML)
}

export function connect () {
  return {
    names: ['render'],
    handler: onRender,
    targets: [],
  }
}
