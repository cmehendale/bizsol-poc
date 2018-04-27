
import {ServiceConfig, SERVICE} from '@819/service-ts/dist/backend'
import { BizsolService } from './core/service'

(async ()=> {
    (await (await (new BizsolService()).init(new ServiceConfig())).start()).waitFor(SERVICE.STATE.RUNNING)
})()