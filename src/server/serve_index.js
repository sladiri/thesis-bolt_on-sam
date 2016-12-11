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
  <div id="root">${html || ''}</div>
  <script>
    Promise.all([
      System.import('bolt_on-sam'),
    ])
  </script>
`

let view = index()

export function onRender (input) {
  view = index(input.node.outerHTML)
}

export function connect () {
  return {
    names: ['render'],
    handlers: [onRender],
    targets: [],
  }
}

export default async function serveIndex (ctx) {
  ctx.body = view
}
