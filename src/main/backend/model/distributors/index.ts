
// import db from '../db'

// const DISTRIBUTORS = 'distributors'

 export class DistributorDB {
	
// 	private distributors:any

// 	constructor() {
// 		this.distributors = db.get('distributors')
// 	}

// 	async add(id:string, name:string, sale:number) {
		
// 		const d = await this.distributors.find({id:id}).value()
// 		if (d) throw new Error("Distributor Already Exists")
		
// 		return await this.distributors
// 							.push({id:id, name:name, sale:sale})
// 							.write()
// 	}

// 	async find(id:string) {
// 		return await this.distributors
// 							.find({id:id})
// 							.value()
// 	}

// 	async sale(id:string, sale:number) {
// 			return await this.distributors.find({id:id})
// 								.assign({sale: sale})
// 								.write()
// 	}

// 	async all(): Promise<any[]> {
// 		return this.distributors
// 	}
 }

export const distributorDB = new DistributorDB()