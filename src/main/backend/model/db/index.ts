const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

import Model from './model'
import Customer from './customer'
import OrderItem from './order-item'
import Product from './product'
import Scheme from './scheme'

export const CREATED  = 'created'
export const SCHEME   = 'scheme'
export const CUSTOMER = 'customer'
export const ORDER_ITEM    = 'order_item'
export const PRODUCT  = 'product'

const INIT_DB = {
	created    : true, 
	scheme     : [], 
	customer   : [], 
	strategy   : [], 
	order_item : [],
	product    : []
}

export class DB {

	private db: any

	constructor(name:string) {
		this.create(name);
	}

	create(name:string):DB {
		if (!this.db) this.db = low(new FileSync(name))			
		if (!this.db.has(CREATED).value()) this.db.defaults(INIT_DB).write()
		return this
	}

	get CUSTOMER(): Entity<Customer> {
		return new Entity<Customer>(this.db.get(CUSTOMER), Customer) 
	}

	get ORDER_ITEM(): Entity<OrderItem> {
		return new Entity<OrderItem>(this.db.get(ORDER_ITEM), OrderItem);
	}

	get PRODUCT(): Entity<Product> {
		return new Entity<Product>(this.db.get(PRODUCT), Product);
	}

	get SCHEME(): Entity<Scheme> {
		return new Entity<Scheme>(this.db.get(SCHEME), Scheme);
	}
	
}

export type ConstType<T> = new (...args: any[]) => T

export class Entity<T extends Model> {
	
	

	get ID_FIELD() {
		return (this.marshaller as any).ID_FIELD
	}

	constructor(protected db:any, private marshaller: ConstType<T>) {}


	async load(data:any) {		
		for (let ii = 0; ii < data.length; ii++) {
			const cc = new this.marshaller(data[ii])
			await this.add(cc)
		}
	}

	buildFilter(IDS:string[], obj:any) {
		const filter:any = {}
		for (let ii = 0, ID = IDS[ii]; ii < IDS.length; ii++) {
			if (obj.hasOwnProperty(ID))
				filter[ID] = obj[ID]			
		}
		return filter
	}

	async exists(obj: any): Promise<T> {
		const IDS = this.ID_FIELD.split(',')
		const filter = this.buildFilter(IDS, obj)
		return await this.find_by(filter)
	}

	async find_by(filter:any): Promise<T> {
		const o = await this.db.find( (o:any) => { 
			const keys = Object.keys(filter)
			for (let ii = 0, key = keys[ii]; ii < keys.length; ii++) {				
				if (o.hasOwnProperty(key)) {
					const found = o[key] === filter[key]
					if (!found) return found 
				}
			}
			return true
		 }).value()
		return o ? new this.marshaller(o): <T>o
	}

	async find(field: string, value:any): Promise<T> {
		const o = await this.db.find( (o:any) => { return o[field] == value }).value()
		return o ? new this.marshaller(o): <T>o
	}

	async find_all(filterFn:any = (o:any)=> true): Promise<T[]> {
		return await this.db.filter(filterFn).value()
	}

	async add(obj: any): Promise<T> {

		return (await this.exists(obj)) || 
			   (await this.db.push(obj).write())
	}

}


// export class OrderEntity extends Entity<Order> {
	
// 	async add(obj: any): Promise<Order> {
// 		let oo:Order = await this.find(Order.ID_FIELD, obj.ID())
// 		if (oo) {
// 			const oItems = oo.orderItems || []
			
// 			if (oItems.find((o:any)=> { return o.ALCANB === obj.ALCANB && o.ITEM === obj.ITEM && o.ORDDT2 === obj.ORDDT2})) return oo 
			
// 			oItems.push(obj)
			
// 			oo.orderItems = oItems 			
// 			console.log("oo.orderItems.length", oo.ID(), oo.orderItems.length)
// 			await this.db.find((o:any)=> { o.ID() === oo.ID() }).assign(oo).write() //this.db.write()
// 			return oo 
// 		}

// 		const orderData:any = { orderItems: [obj] }
// 		orderData[Order.ID_FIELD] = obj[Order.ID_FIELD];
		
// 		oo = new Order(orderData)
// 		await this.db.push(oo).write()
// 		return oo
// 	}
// }


//export default db
export default new DB('bizsol.db')