import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {pipe} from 'ramda'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
  properties: {
    foo: {type: 'string'},
  },
}, log)

const model = {
  field: 42,
}

const clone = pipe(::JSON.stringify, ::JSON.parse)

export function onPropose () {
  const cloned = clone(model)
  model.field += 1
  return {model: cloned}
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['stateRepresentation'],
}
