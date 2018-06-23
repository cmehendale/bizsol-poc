import {Application, riot} from '@819/service-ts/dist/frontend'

import {BizsolService} from './service';

export class BizsolApplication extends Application {

    initService() {
       return new BizsolService();
    }

}

export {riot}