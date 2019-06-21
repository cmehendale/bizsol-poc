// import {Application, riot} from './app';

// if ((global as any).window) (global as any).window.riot = riot
// require('../shared/tags')

// module.exports = {
//     Application
// }
import {Application, riot} from './base-app'
import {Service, Api} from './base-service'

if ((global as any).window) (global as any).window.riot = riot; // required for defining the tags
(global as any).riot = riot // required for defining the tags
require('../shared/tags')

export {Application, riot, Service, Api }
module.exports.Application = Application
module.exports.riot = riot
