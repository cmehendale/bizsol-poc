import {BaseService2, Service2} from './service2'
import * as path from 'path'
import * as E from 'express'

// import {customerDB} from '../model/customers'
// import {schemeDB} from '../model/schemes'
import {bootstrap} from '../bootstrap'
import { RuleEngine } from 'backend/core/rule-engine';

import DB from 'backend/model/db'

import OrderItem from 'backend/model/db/order-item';
import Customer from 'backend/model/db/customer';
import { Config, Util } from 'backend/util';

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
		this.app.post('/api/enterOrder',        this.wrap('/api/enterOrder',        this.enterOrder.bind(this)))
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

                        const sale  = Number(oi[OrderItem.TOTAL_FIELD])
                        const poles = Number(oi[OrderItem.POLES_FIELD])
                        const discount = oi[OrderItem.NET_FIELD] ? (sale - Number(oi[OrderItem.NET_FIELD] || '0')): 0
                        data.sale     += sale
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
        const items = await DB.PRODUCT.find_all()
				console.log(items.find((ii:any) => ii.JBADR0 == 199))
				return items
	}

    async calculateDiscount(req: E.Request, res: E.Response): Promise<any> {
        return await new RuleEngine().execute(req.body.customer, req.body.orderList.map((item:any) => new OrderItem(item)))
	}

    async enterOrder(req: E.Request, res: E.Response): Promise<any> {
        const customer = req.body.customer
        const orderList = req.body.orderList
        const outcome = req.body.outcome

        let discountPer = (outcome.discount.value || 0) / orderList.length
        if (discountPer < 0) { discountPer = 0 }

        let orderItems = orderList.map((o: any) => {
            return Object.assign({}, o, {
                TERRN: customer.TERRN,
                DZCTTX: customer.DZCTTX,
                ALBYCD: customer.ALBYCD,
                ALBKCD: customer.ALBKCD,
                HOUSE: customer.DLA7TX,
                ALCANB: customer[Customer.ID_FIELD],
                ALCLTX: customer[Customer.NAME_FIELD],
                ALCPTX: customer.ALCPTX,
                CUPPB: customer.CUPPB,
                TRNPBK: customer.CUPPB,
                FLCVNB: '',
                TAX_SUF: o.TAX_SUF, //'12/03/18',
                ORDDT2: 905,
                ORDREF: 'F01-TRAVELEX',
                Inv: {' Date': '00/00/00'},
                Family: o[OrderItem.FAMILY_FIELD],
                [OrderItem.NET_FIELD]: (o[OrderItem.TOTAL_FIELD] - discountPer)
            })
        })

        await DB.ORDER_ITEM.add_all(orderItems)
        return { success: true }

        // return await new RuleEngine().execute(req.body.customer, req.body.orderList.map((item:any) => new OrderItem(item)))
	}

}