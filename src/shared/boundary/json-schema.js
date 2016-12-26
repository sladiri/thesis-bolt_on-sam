import {logConsole} from './logger'
import Ajv from 'ajv'

const log = logConsole('json_schema')

const ajv = new Ajv({
  v5: true,
  allErrors: true,
})

export default (schema, logger = log) => {
  const validate = ajv.compile(schema)
  return input =>
    validate(input) ||
    do{
      logger('[schema error]', JSON.stringify(validate.errors), JSON.stringify(input))
      false
    }
}
