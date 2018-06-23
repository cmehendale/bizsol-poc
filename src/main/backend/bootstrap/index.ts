// import {distributorDB} from '../model/distributors'
// import {schemeDB, Scheme} from '../model/schemes'

import * as _ from 'lodash'
import * as YAML from 'yamljs'
import * as fs from 'fs-extra'

import DB from '../model/db'

export class Bootstrap {

	async initCustomers() {
		const data = YAML.load('./bootstrap_data/customer_data.yml');
		await DB.CUSTOMER.load(data)
		console.log('CUSTOMERS', (await DB.CUSTOMER.find_all()).length)
		
	}

	async initOrderItems() {
		const data = YAML.load('./bootstrap_data/order_data.yml');		
		await DB.ORDER_ITEM.load(data)
		
		console.log('ORDER_ITEMS', (await DB.ORDER_ITEM.find_all()).length)
	}

	async initProducts() {
		const data = YAML.load('./bootstrap_data/product_data.yml');
		await DB.PRODUCT.load(data)
		console.log('PRODUCTS', (await DB.PRODUCT.find_all()).length)
	}
	
	async initSchemes() {
		const s1 = YAML.load('./bootstrap_data/schemes/scheme-f04.yml');
		const s2 = YAML.load('./bootstrap_data/schemes/scheme-f11-Apr.yml');
		const s3 = YAML.load('./bootstrap_data/schemes/scheme-f11-May.yml');
		await DB.SCHEME.load([s1, s2, s3])
		console.log('SCHEMES', (await DB.SCHEME.find_all()).length)
		
	}

	async bootstrap() {
		await this.initCustomers()
		await this.initOrderItems()
		await this.initProducts()
		await this.initSchemes()
	}

}

export const bootstrap = new Bootstrap()