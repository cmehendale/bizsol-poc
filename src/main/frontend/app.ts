import {Application, riot} from './base-app'

import {BizsolService} from './service';

export class BizsolApplication extends Application {

    initService() {
       return new BizsolService();
    }

}

export {riot}