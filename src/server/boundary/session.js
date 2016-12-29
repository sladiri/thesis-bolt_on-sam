export const sessionKeys = ['some secret hurr']

let nextId = Number.MIN_SAFE_INTEGER

export async function setupSession (ctx, next) {
  const {session} = ctx
  session.id = session.id || nextId++
  return next()
}
