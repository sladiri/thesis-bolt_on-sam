import {connect, getSink} from '../../shared/boundary/connect-postal'
import renderOptions from './render-dom'
import sseToBus from './bus-adapters/sse-to-bus-adapter'
import busToHttp from './bus-adapters/bus-to-http-adapter'

connect(renderOptions)

sseToBus('/sse')
busToHttp({url: '/actions', targets: ['actions']})

getSink({targets: ['actions'], logTag: 'client-wire'})({action: 'init'})
// const actionSink = getSink({targets: ['actions'], logTag: 'client-wire'})
// setInterval(() => {
//   actionSink({meta: {}})
// }, 100)
