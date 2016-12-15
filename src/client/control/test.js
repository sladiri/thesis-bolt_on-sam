import {logConsole} from '../../shared/boundary/logger'
import {pony} from '../../shared/control/pony'

const log = logConsole('client')

async function testFoo (ctx) {
  log('foo', `${JSON.stringify(await pony(200))}`)
}
testFoo()
