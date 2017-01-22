import {connect} from '../../shared/boundary/connect-postal'
import renderOptions from './render-dom'
import sseToBus from './sse-to-bus-adapter'
import busToHttp from './bus-to-http-adapter'

connect(renderOptions)

sseToBus('/sse')
busToHttp({url: '/actions', targets: ['actions']})
