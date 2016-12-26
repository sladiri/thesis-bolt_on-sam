import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'

const log = logConsole('model')

export const validate = validateAndLog({
  properties: {
    foo: {type: 'string'},
  },
}, log)

const model = {
  field: 42,
}

export function onPropose () {
  const clone = JSON.parse(JSON.stringify(model))
  model.field += 1
  return {model: clone}
}

export default {
  topics: ['propose'],
  validate,
  handler: onPropose,
  targets: ['stateRepresentation']
}
