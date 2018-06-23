import {BaseService2, Service2, Config, Util, express as E} from '@819/service-ts/dist/backend'
import * as path from 'path'

import {distributorDB} from '../model/distributors'
import {schemeDB} from '../model/schemes'
import {bootstrap} from '../bootstrap'
import { RuleEngine } from 'backend/core/rule-engine';
import OrderItem from 'backend/model/db/order-item';

import DB from 'backend/model/db'
import Customer from 'backend/model/db/customer';

export class BizsolService extends BaseService2 {

    resolveViewDirs():string[] {
        const superViewDirs = super.resolveViewDirs()

        let viewDirs = Config.viewDir([[__dirname, '..', 'view/templates'].join('/')])
        viewDirs = Util.flatten(viewDirs.concat(superViewDirs))
       // console.log("VIEWDIRS", viewDirs)
        return viewDirs
    }

    resolveTagDirs():string[] {
        const superTagDirs = super.resolveTagDirs()
        let tagDirs = Config.tagDir([path.normalize([__dirname, '..', '..', 'shared/tags'].join('/'))])
        tagDirs = Util.flatten(tagDirs.concat(superTagDirs))
        // console.log("TAGDIRS", tagDirs)
        return tagDirs
    }

    initApiRoutes() {
        super.initApiRoutes()
		this.app.get('/api/distributorList', this.wrap('/api/distributorList', this.distributorList.bind(this)))
		this.app.get('/api/itemList',        this.wrap('/api/itemList',        this.itemList.bind(this)))
		this.app.post('/api/calculateDiscount',        this.wrap('/api/calculateDiscount',        this.calculateDiscount.bind(this)))
    }

    async bootstrap():Promise<Service2> {
        console.log("in Bootstrap")
        await super.bootstrap()
        await bootstrap.bootstrap()
        return this
    }

    // API
    async distributorList(req: E.Request, res: E.Response): Promise<any> {
        const salesData = await DB.ORDER_ITEM.find_all()
        return await (await DB.CUSTOMER.find_all()).map((dd:any) => {
            dd.sale = salesData.reduce(
                (sales: number, oi:any): number => {
                if (oi[OrderItem.CUST_FIELD] == dd[Customer.ID_FIELD]) {                    
                    sales += oi[OrderItem.QTY_FIELD] * oi[OrderItem.RATE_FIELD]
                }
                return sales
            }, 0)
            return dd
        })
	}

    async itemList(req: E.Request, res: E.Response): Promise<any> {
		// return [{id:1, name:'6A Switch SP One Way', rate:100}, {id:2, name:'6/16 A Socket 3 PIN', rate:150}]
        return await DB.PRODUCT.find_all()
	}

    async calculateDiscount(req: E.Request, res: E.Response): Promise<any> {
        return await new RuleEngine().execute(req.body.distributor, req.body.orderList.map((item:any) => new OrderItem(item)))
	}
    
}