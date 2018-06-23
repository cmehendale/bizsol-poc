import {Service, Api} from '@819/service-ts/dist/frontend'

export class BizsolService extends Service { 

    initApis():Api[] {
        return [
            new Api("distributor:list", this.distributorList.bind(this)),
            new Api("item:list", this.itemList.bind(this)),
            new Api("calculate:discount", this.calculateDiscount.bind(this))
        ]
    }

    async distributorList() {
        return (await this.get('api/distributorList'));
    }

    async itemList() {
        return (await this.get('api/itemList'));
    }

    async calculateDiscount(params:any) {
        return (await this.post('api/calculateDiscount', params));
    }
    
}