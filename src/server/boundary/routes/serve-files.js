import send from 'koa-send'

export default path => async function serveFiles (ctx) {
  const prefix = `${path && path !== '/' ? `${path}` : ''}`
  await send(ctx, `${prefix}${ctx.path}`)
}
