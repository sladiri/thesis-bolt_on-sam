
import '../control/test'
import {connect} from '../../shared/boundary/connect-postal'
import sseToBus from './bus-adapters/sse-to-bus-adapter'
import renderOptions from './render-dom'

connect(renderOptions)

sseToBus('/sse')
