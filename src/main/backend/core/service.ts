import {BaseService2, Service2, Config, Util, express as E} from '@819/service-ts/dist/backend'
import * as path from 'path'

// import {customerDB} from '../model/customers'
// import {schemeDB} from '../model/schemes'
import {bootstrap} from '../bootstrap'
import { RuleEngine } from 'backend/core/rule-engine';

import DB from 'backend/model/db'

import OrderItem from 'backend/model/db/order-item';
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
		this.app.get('/api/customerList', this.wrap('/api/customerList', this.customerList.bind(this)))
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
    async customerList(req: E.Request, res: E.Response): Promise<any> {
        const salesData = await DB.ORDER_ITEM.find_all()
        return await (await DB.CUSTOMER.find_all()).map((dd:any) => {
            let doo = Object.assign({}, dd,
                salesData.reduce(
                    (data:any , oi:any): any => {
                    if (String(oi[OrderItem.CUST_FIELD]) == String(dd[Customer.ID_FIELD])) {
                        
                        const sale  = Number(oi[OrderItem.TOTAL_FIELD]) //Number(oi[OrderItem.QTY_FIELD]) * Number(oi[OrderItem.RATE_FIELD])
                        const poles = Number(oi[OrderItem.POLES_FIELD])
                        const discount = oi[OrderItem.NET_FIELD] ? (sale - Number(oi[OrderItem.NET_FIELD] || '0')): 0
                        data.sale     += sale //(oi[OrderItem.QTY_FIELD] * oi[OrderItem.RATE_FIELD])
                        data.poles    += poles
                        data.discount += discount

                        data.families = [ ...(data.families
                                                  .filter((f:any) => f != oi[OrderItem.FAMILY_FIELD])),
                                            oi[OrderItem.FAMILY_FIELD]
                                        ]                                        
                    }                    
                    //if (data.families.length > 0) console.log("FAMILY", dd.ALCLTX, data.families)
                    return data
                }, {sale:0, poles:0, discount:0, families:[]})
            )
            //console.log("DOO", doo)
            return doo
        })
        .filter((a: any) => {
            return a.poles != 0 || a.sale != 0
        })
	}

    async itemList(req: E.Request, res: E.Response): Promise<any> {
		// return [{id:1, name:'6A Switch SP One Way', rate:100}, {id:2, name:'6/16 A Socket 3 PIN', rate:150}]
        return await DB.PRODUCT.find_all()
	}

    async calculateDiscount(req: E.Request, res: E.Response): Promise<any> {
        return await new RuleEngine().execute(req.body.customer, req.body.orderList.map((item:any) => new OrderItem(item)))
	}
    
}