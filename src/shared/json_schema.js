import {logConsole} from './logger'
import Ajv from 'ajv'

const log = logConsole('json_schema')

const ajv = new Ajv({
  v5: true,
  allErrors: true,
})

ajv.addKeyword('instanceof', {
  compile: instance => data => data instanceof instance,
})

export default (schema, logger = log) => {
  const validate = ajv.compile(schema)
  return input =>
    validate(input) || do{ logger(JSON.stringify(validate.errors)); false }
}
