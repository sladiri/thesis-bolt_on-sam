export default async function errorHandler ({body, status}, next) {
  try {
    await next()
  } catch (err) {
    body = { message: err.message }
    status = err.status || 500
  }
}
