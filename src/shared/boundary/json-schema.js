import {logConsole} from './logger'
import Ajv from 'ajv'

const logName = 'json_schema'
const log = logConsole(logName)

const ajv = new Ajv({
  v5: true,
  allErrors: true,
})

export default (schema, logger = log) => {
  const validate = ajv.compile(schema)
  return input => {
    const ok = validate(input)
    return [
      ok,
      ok
        ? undefined
        : do{
          logger('[schema error]', JSON.stringify(validate.errors), JSON.stringify(input))
          validate.errors
        },
    ]
  }
}
