export const sessionKeys = ['some secret hurr']

let nextId = Number.MIN_SAFE_INTEGER

export async function setupSession (ctx, next) {
  const {session} = ctx
  session.id = session.id === undefined
    ? nextId++
    : session.id

  return next()
}
