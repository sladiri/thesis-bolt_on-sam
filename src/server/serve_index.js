import send from 'koa-send'

export default async function serveIndex (ctx) {
  await send(ctx, '/public/index.html')
}
