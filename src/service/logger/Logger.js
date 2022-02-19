const log4js = require('log4js')
const config = require('./config-log4js.json')
log4js.configure(config)
module.exports = log4js