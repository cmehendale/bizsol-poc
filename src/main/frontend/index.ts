
import {BizsolApplication, riot} from './app'

if ((global as any).window) (global as any).window.riot = riot // required for defining the tags
require('../shared/tags')

export {BizsolApplication}
module.exports = BizsolApplication
