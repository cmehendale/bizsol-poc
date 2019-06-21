
import {ServiceConfig} from './core/service2'
import { BizsolService } from './core/service'
import { SERVICE } from './util'

(async ()=> {
    (await (await (new BizsolService()).init(new ServiceConfig())).start()).waitFor(SERVICE.STATE.RUNNING)
})()