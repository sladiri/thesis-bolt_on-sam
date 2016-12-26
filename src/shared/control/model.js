import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {pipe} from 'ramda'

const log = logConsole('model')

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
  validate,
  handler: onPropose,
  targets: ['stateRepresentation']
}
