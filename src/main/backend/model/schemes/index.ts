
// import * as _ from 'lodash'
// import db from '../db'

export class SchemeDB {

// 	private schemes:any

// 	constructor() {
// 		this.schemes = db.get('schemes')
// 	}
	
// 	async find_all(ids:string[]): Promise<Scheme[]> {
// 		return await this.schemes.filter((s:any)=> { return ids.indexOf(s.id) >= 0 }).value()
// 	}

// 	async find(id:string) {
// 		return await this.schemes.find({id:id}).value()
// 	}

// 	async add(data:any) {
		
// 		const s = await this.find(data.id)
// 		if (s) throw new Error("Scheme is already existing")
		
// 		await this.schemes.push(data).write()

// 	}

// 	async all():Promise<Scheme[]> {
// 		return _.map((await this.schemes.value()), (s:any)=> { return new Scheme(s) })
// 	}

}

export class Scheme {

// 	constructor(private _data:any) {}

// 	get data():any {
// 		return this._data
// 	}

// 	async outcome(data:any): Promise<any> {
// 	}

}

export const schemeDB = new SchemeDB()