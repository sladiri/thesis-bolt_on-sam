import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import {encryptSecret, decryptSecret} from '../boundary/jwtoken-secret'

const logName = 'model'
const log = logConsole(logName)

export const validate = validateAndLog({
  required: ['meta'],
  properties: {
    meta: {
      properties: {
        secret: {type: 'string'},
      },
    },
  },
}, log)

const model = {
  field: 42,
}

export function onPropose ({meta}) {
  const decoded = meta.secret
    ? decryptSecret(meta.secret)
    : { foo: 'bar ' + model.field }

  const secret = encryptSecret(decoded)

  model.field += 1
  return {
    meta: {...meta, secret},
    model: {...model, id: meta.sessionId},
  }
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['stateRepresentation'],
}
