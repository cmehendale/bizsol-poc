// use promise-based specifications 
import Engine from '../model/json-rules'
import {strategies}  from '../model/strategies'
import {actions} from '../model/actions'

import {moment} from '@819/service-ts'
import * as _ from 'lodash'

import DB from '../model/db'
import Scheme from '../model/db/scheme'

const minimist = require('minimist')
import {ResidualMixin, PercentageToFreebiesMixin} from './scheme-mixin'
import OrderItem from 'backend/model/db/order-item';
import {createInputData, InputData} from 'backend/model/order-data'
import Customer from 'backend/model/db/customer';

import * as mixins from 'backend/core/scheme-mixin'

//import {safeFact, CustomEventType, CustomEventMap} from './event-util'

export class RuleEngine {

	constructor() {}

	async eligible(data:InputData):Promise<Scheme[]> {

		const schemes: Scheme[] = await DB.SCHEME.find_all()

		const schemeMap:any = _.reduce(schemes, 
			(map:any, s:Scheme): any => { map[s.id] = s; return map }, {})

		const ruleEngine = Engine()

		for (let ii=0; ii < schemes.length; ii++) { 
			//console.log("ADDING", schemes[ii].id, schemes[ii].eligibility)
			await ruleEngine.addRule( schemes[ii].eligibility ) 
		}

		const result = await ruleEngine.run(data)
		//console.log("Result", result)

		return result.filter((e:any) => e.type == 'done').map((e:any) => schemeMap[e.params.id])
	}

	async benefits(data:InputData, eligible:Scheme[]):Promise<any> {
		
		for (let ii=0; ii < eligible.length; ii++) {
			let engine = Engine()
			for (let jj=0; jj < eligible[ii].benefits.length ; jj++) { 
				await engine.addRule( eligible[ii].benefits[jj] ) 
			}			
			const mixin = (mixins as any)[eligible[ii].type]
			if (mixin) {
				const mixinInstance = new mixin()
				await mixinInstance.process(engine, data) //engine.run(data)
			}
		}

		return data.meta
	}

	async output(data:any, benefits:any[]):Promise<any> {
		// const strategyName = data.strategy || 'max'
		// const strategy:(a:any[], path:string)=>any = strategies[strategyName]
		// if (!strategy) throw new Error(`Unknown Strategy - available strategies -- ${Object.keys(strategies)}`)

		// const strategyValue = strategy(benefits, 'value');
		// const schemeMeta  = await schemeDB.find_all(_.map(strategyValue.meta, (mm) => { return mm.params.id })) 
		// strategyValue.meta = schemeMeta;
		// return { name: strategyName, value: strategyValue }

	}

	async execute(customer: Customer, orderItems:OrderItem[]) {
	
		// // data = {
		// // 	order    : {},
		// // 	sales    : {},
		// // 	residual : {}
		// // }

		// const engine  = Engine()
		// const schemes = await DB.SCHEME.find_all()
		
		// for (let ii = 0; ii < schemes.length ; ii++) {
		// 	for (let jj = 0; jj < schemes[ii].benefits.length; jj++) {
		// 		engine.addRule(schemes[ii].benefits[jj])
		// 	}
		// }

		// addFactFn(RESIDUE)		

		// engine.addFact('residue', async (params:any, almanac:any, options:any = { cache: false})=> {
		// 	return await safeFact(almanac, 'sales', null)
		// })

		// engine.addFact('count', async (params:any, almanac:any, options:any = { cache: false})=> {
		// 	const count:any = await safeFact(almanac, 'ccnt', {})
		// 	if (params.id) count[params.id] = count[params.id] || 0
		// 	return count
		// })

		// engine.on('done', async (event:string, almanac:any, result:any)=> {
		// 	let outcome = await safeFact(almanac, 'outcome', 0)
		// 	console.log("OUTCOME IN DONE", outcome)
		// })

		// engine.on('emit_event', async (event:string, almanac:any, result:any)=> {

		// 	const condition: any = await this.findMatchedCondition(result.conditions)
		// 	if (condition.event) {
		// 		const ee: any = condition.event as any
		// 		engine.emit(ee.type, ee.params, almanac, result)
		// 	}
		// })


		// engine.on('residue', async (event:string, almanac:any, result:any) => {

		// 	const condition = await this.findMatchedCondition(result.conditions)
		// 	const value = condition.value 
			
		// 	const sales = await almanac.factValue('residue')
		// 	const residue = sales - value

		// 	let outcome = await this.safeFact(almanac, 'outcome', 0)
		// 	outcome += condition.outcome

		// 	let count:any = await this.safeFact(almanac, 'count', {})
		// 	if (condition.count) count[condition.id || 'default'] = (count[condition.id  || 'default'] || 0) + (condition.count || 0)
		// 	console.log("OUTCOME", outcome, "COUNT", count, "RESIDUE", residue)

		// 	// if (condition.max_count && count[condition.id] >= condition.max_count) 
		// 	// 	return	

		// 	setTimeout(async () => {
		// 		console.log("RUNNING AGAIN")
		// 		await engine.addFact('residue', residue)
		// 		await engine.addFact('outcome', outcome)
		// 		await engine.addFact('count',   count)
		// 		await engine.run(data)
		// 	})
		// })

		// engine.on('success', (event:string, almanac:any, result:any) => {
		// 	//console.log("SUCCESS", event, result)
		// })

		// engine.on(CustomEventType.EMIT_EVENT, CustomEventMap.EMIT_EVENT(engine))
		// engine.on(CustomEventType.LOOP_RESIDUAL, CustomEventMap.LOOP_RESIDUAL(engine, data, "residue"))
		// await engine.run(data)

		// const scheme = new PercentageToFreebiesMixin()
		// await scheme.process(engine, data)
		// await engine.run(data)
		// console.log("RESULT", await scheme.outcome)

		// const eligible:Scheme[] = await this.eligibleSchemes(data)
		// const benefits:any[]    = await this.schemeBenefits(eligible, data)

		// return await this.output(data, benefits)


		const salesItems = await DB.ORDER_ITEM.find_all((item:any) => { return item[OrderItem.CUST_FIELD] == (customer as any)[Customer.ID_FIELD]})
		const inputData  = await createInputData(orderItems, salesItems);

		const eligible   = await this.eligible(inputData)
		return await this.benefits(inputData, eligible)
		
	}

}

// (async()=> {
// 	try {
// 		const argv = minimist(process.argv.slice(2))
// 		console.log("Running Rule engine", argv);
// 		await new RuleEngine().execute(argv.customer, argv.data)
// 	} catch (a) {
// 		console.log(a.message)
// 		console.log(a)
// 	}
// })()