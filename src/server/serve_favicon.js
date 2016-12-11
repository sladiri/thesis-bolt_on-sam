import path from 'path'
import favicon from 'koa-favicon'

const iconPath = '../../public/favicon/foot/favicon.ico'
const options = {maxAge: 1000 * 60 * 10}
export default favicon(path.join(__dirname, iconPath), options)
