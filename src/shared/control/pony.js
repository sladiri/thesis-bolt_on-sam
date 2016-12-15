import {delay} from 'bluebird'

const ponyFoo = 'ponyfoo'.split('')

export async function* foo (timeout = 0) {
  const values = ponyFoo.map(::Promise.resolve)
  for (const promise of values) {
    const value = await delay(timeout, promise)
    yield value
  }
}

export async function pony (timeout) {
  const result = []
  for await (const data of foo(timeout)) {
    result.push(data)
  }
  return {
    promise: await Promise.resolve(42),
    result: result.join(''),
  }
}
