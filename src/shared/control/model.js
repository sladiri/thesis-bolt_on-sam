import {logConsole} from '../boundary/logger'
import validateAndLog from '../boundary/json-schema'
import jwt from 'jsonwebtoken'

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

const jwtSecret = 'shhhhh'

export function onPropose ({meta}) {
  const decoded = meta.secret
    ? jwt.verify(meta.secret, jwtSecret)
    : { id: Number.MIN_SAFE_INTEGER }

  decoded.id += 1
  const secret = jwt.sign(decoded, jwtSecret)

  model.field += 1
  return {
    meta: {...meta, secret},
    model: {...model, id: decoded.id},
  }
}

export default {
  topics: ['propose'],
  logTag: logName,
  validate,
  handler: onPropose,
  targets: ['stateRepresentation'],
}
