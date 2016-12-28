
import '../control/test'
import {connect} from '../../shared/boundary/connect-postal'
import renderOptions from './render-dom'
import sseToBus from './bus-adapters/sse-to-bus-adapter'
import busToHttp from './bus-adapters/bus-to-http-adapter'

connect(renderOptions)

sseToBus('/sse')
busToHttp('/actions')
