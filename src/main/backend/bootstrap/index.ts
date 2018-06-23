// import {distributorDB} from '../model/distributors'
// import {schemeDB, Scheme} from '../model/schemes'

import * as _ from 'lodash'
import * as YAML from 'yamljs'
import * as fs from 'fs-extra'

import DB, { ORDER_ITEM } from '../model/db'
import OrderItem from 'backend/model/db/order-item';
import Product from 'backend/model/db/product';

export class Bootstrap {

	async initCustomers() {
		let data = [ 
			...YAML.load('./bootstrap_data/customer_data.yaml'),
		    ...YAML.load('./bootstrap_data/customer_data_1.yaml') 
		]
		await DB.CUSTOMER.load(data)

		console.log('CUSTOMERS', (await DB.CUSTOMER.find_all()).length)
		
	}

	addFamily(data:any[], prodmap:any) {
		return data.map((d:any) => {
			d[OrderItem.FAMILY_FIELD] = prodmap[d[OrderItem.CODE_FIELD]][Product.FAMILY_FIELD]
			return d
		})
	}

	async initOrderItems() {

		const prods = await DB.PRODUCT.find_all()
		const prodmap = prods.reduce((pm:any, p) => {
			pm[p.IDVAL] = p; return pm
		}, {})

		let data = [ 
			...YAML.load('./bootstrap_data/order_data.yaml'),
			...YAML.load('./bootstrap_data/order_data_1.yaml')
		]
		
		data = this.addFamily(data, prodmap)
		await DB.ORDER_ITEM.load(data)
		
		console.log('ORDER_ITEMS', (await DB.ORDER_ITEM.find_all()).length)
	}

	async initProducts() {
		
		let data  = [ 
			...YAML.load('./bootstrap_data/product_data.yaml'),
			...YAML.load('./bootstrap_data/product_data_1.yaml') 
		];
		
		await DB.PRODUCT.load(data)
				
		console.log('PRODUCTS', (await DB.PRODUCT.find_all()).length)
	}
	
	async initSchemes() {
		// const s5 = YAML.load('./bootstrap_data/schemes/scheme-rcbs.yml');
		// const s6 = YAML.load('./bootstrap_data/schemes/scheme-dbs.yml');
		await DB.SCHEME.load([
			YAML.load('./bootstrap_data/schemes/scheme-f04.yml'),
			YAML.load('./bootstrap_data/schemes/scheme-f11-Apr.yml'),
			YAML.load('./bootstrap_data/schemes/scheme-f11-May.yml'),
			YAML.load('./bootstrap_data/schemes/scheme-mcbs.yml')
		])
		console.log('SCHEMES', (await DB.SCHEME.find_all()).length)
		
	}

	async bootstrap() {
		await this.initCustomers()
		await this.initProducts()
		await this.initOrderItems()
		await this.initSchemes()
	}

}

export const bootstrap = new Bootstrap()