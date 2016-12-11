export default async function responseLogger (ctx, next) {
  const start = new Date()

  await next()

  const elapsed = new Date() - start
  ctx.set('X-Response-Time', `${elapsed}ms`)

  if (!ctx.url.startsWith('/public/jspm_packages')) {
    console.log(`server :: ${ctx.method} ${ctx.url} - ${elapsed}ms elapsed`)
  }
}
