// import { findMatchedCondition, safeFact } from "./event-util";
// import { InputData } from "backend/model/order-data";

// import DB from 'backend/model/db'
// import Product from "backend/model/db/product";
// import Scheme from "backend/model/db/scheme";

// export enum INPUT_FACT_CONSTANTS {
//   SALES = "sales"
// }

// export interface SchemeMixin {
//   outcome?:any
//   process(engine: any, data: any): void;
// }

// export class BaseMixin implements SchemeMixin {
//   DONE = "done";
//   EMIT = "emit";
//   COUNT = "count";
//   OUTCOME = "outcome";
//   DISCOUNT = "discount";

//   async findAndAddCondition(data:InputData, conditions:any):Promise<any> {
//     const condition:any = await findMatchedCondition(conditions)
//     if (condition) {
//       data.meta = data.meta || {}
//       data.meta.conditions = data.meta.conditions || []
//       data.meta.conditions.push(condition)
//     }
//     return condition
//   }

//   async outcome(data:any, scheme:string):Promise<any> {
//     return Object.assign({}, data.meta[scheme].outcome)
//   }

//   async done(data:InputData, params:any, almanac: any, result: any): Promise<any> {
    
//     const outcome = await almanac.factValue(this.OUTCOME)
//     console.log("ALM.OUTCOME", outcome, params)
//     data.meta = data.meta || {}
    
//     const key = params.id || 'Default'
//     const scheme = data.meta[key] || {}
//     if (data.meta.conditions) {
//       scheme.conditions = data.meta.conditions
//       data.meta.conditions = []
//     }

//     scheme.meta    = await DB.SCHEME.find(Scheme.ID_FIELD, key)
//     scheme.outcome = Object.assign({}, outcome)
//     data.meta[key] = scheme

//     const final = await this.outcome(data, key)
//     console.log("FINAL", final)
//     data.meta.outcome = await this.merge(data.meta.outcome, final)    
//     console.log("data.meta.outcome", data.meta.outcome)
//   }

//   async merge(dataOutcome: any, outcome: any): Promise<any> {
//     return Object.assign({}, (dataOutcome || {}), outcome)
//   }

//   async process(engine: any, data: any) {
//     engine.addFact(this.COUNT, {});
//     engine.addFact(this.OUTCOME, data.meta.outcome || {});
    
//     engine.on(
//       this.EMIT,
//       async (params:any, almanac: any, result: any): Promise<any> => {
//         const condition: any = await this.findAndAddCondition(data, result.conditions);
//         if (condition.event) {
//           const ee: any = condition.event as any;
//           engine.emit(ee.type, ee.params, almanac, result);
//         }
//         console.log("IN EMIT", condition.event);
//       }
//     );

    
//     return new Promise((resolve, reject) => {
//       engine.on(
//           this.DONE,
//           async (params:any, almanac: any, result: any): Promise<any> => {            
//             try {
//               const rr = await this.done(data, params, almanac, result)
//               resolve(rr)
//             } catch (all) {
//               // console.log("ERROR", all.stack)
//               reject(all)
//             }
//           })
          
//           // console.log("Running with DATA", data)
//           setTimeout(()=> { 
//             engine.run(data); 
//           })   
//       })
  
//   }
// }

// export class ResidualMixin extends BaseMixin implements SchemeMixin {

//   RESIDUAL = "residual";

//   async outcome(data:InputData, scheme:string): Promise<any> {
    
//     const outcome = await super.outcome(data, scheme)

//     const keys: string[] = Object.keys(outcome)
//     let discount  = 0
//     let items: any  = {}
//     for (let ii = 0; ii < keys.length; ii++) {
//       const p: any = await DB.PRODUCT.find(Product.ID_FIELD, keys[ii])
//       if (p) {
//         discount += outcome[keys[ii]] * p[Product.RATE_FIELD]
//         items[keys[ii]] = {
//           qty  : outcome[keys[ii]],
//           rate : Number(p[Product.RATE_FIELD]), 
//           description: p[Product.DESC_FIELD],
//           code: p[Product.CODE_FIELD]
//         }
//       }
//     }

//     outcome[this.DISCOUNT] = {
//       value   : discount,
//       percent : Math.round(100 * 100 * discount / data.order.total)/100 
//     }

//     outcome.items = items

//     data.meta[scheme].outcome = Object.assign({}, outcome)

//     // console.log("OUTPUT OUTCOME", scheme, data.meta[scheme].outcome)
//     return outcome
//   }

//   async process(engine: any, data: any):Promise<any> {
    
//     engine.addFact(this.RESIDUAL, data[INPUT_FACT_CONSTANTS.SALES].total)

//     engine.on(
//       this.RESIDUAL,
//       async (params:any, almanac: any, result: any): Promise<any> => {

//         const condition = await findMatchedCondition(result.conditions);
//         if (!condition) return;

//         const sales =
//           (await safeFact(almanac, this.RESIDUAL, 0)) - (condition.value || 0);
//         const outcome: any = (await safeFact(almanac, this.OUTCOME, {})) 
        
//         outcome[condition.outcome.id] = 
//           (outcome[condition.outcome.id] || 0) + condition.outcome.value

//         const count: any = await safeFact(almanac, this.COUNT, {});
//         if (condition.id) {
//           count[condition.id] = (count[condition.id] || 0) + 1;
//         }

//         setTimeout(async () => {

//           await engine.addFact(this.RESIDUAL, sales);
//           await engine.addFact(this.OUTCOME, outcome);
//           await engine.addFact(this.COUNT, count);

//           await engine.run(data);
//         });
//       }
//     );

//     return super.process(engine, data);

//   }
// }

// export class PercentageToFreebiesMixin extends BaseMixin implements SchemeMixin {

//     async outcome(data:InputData, scheme: string):Promise<any> {

//       const outcome  = await super.outcome(data, scheme)
//       if (!outcome) return {}

//       // console.log("INPUT OUTCOME", scheme, outcome)

//       const cur = {
//         value   : (data.order.total * outcome[outcome.key]/100),
//         percent : outcome[outcome.key]
//       }

//       const discount   = Object.assign({}, data.meta.outcome.discount || {})

//       discount.value   = (discount.value || 0) + cur.value
//       discount.percent = Math.round(((discount.percent || 0) + cur.percent)*100)/100

//       data.meta[scheme].outcome = Object.assign({}, outcome, {discount: cur})
//       outcome[this.DISCOUNT] = discount
      
//       // console.log("OUTPUT OUTCOME", scheme, data.meta[scheme].outcome)
//       return outcome
//     }

//     async done(data:any, params:any, almanac: any, result: any): Promise<any> {

//       const condition = await this.findAndAddCondition(data, result.conditions);
//       if (condition) {
//         almanac.addRuntimeFact(this.OUTCOME, condition.outcome)
//       }
//       return await super.done(data, params, almanac, result)
//     }
    
// }

// export class SimplePercentageDiscount extends BaseMixin implements SchemeMixin {

//   async outcome(data:InputData, scheme: string):Promise<any> {

//     const outcome  = await super.outcome(data, scheme)
//     if (!outcome) return {}


//     const cur = {
//       value   : (data.order.total * outcome.value/100),
//       percent : outcome.value
//     }
//     console.log("CUR", cur)
//     const discount   = Object.assign({}, (data.meta.outcome || {}).discount || {})

//     discount.value   = (discount.value || 0) + cur.value
//     discount.percent = Math.round(((discount.percent || 0) + cur.percent)*100)/100

//     data.meta[scheme].outcome = Object.assign({}, outcome, {discount: cur})
//     outcome[this.DISCOUNT] = discount
    
//     console.log("RETURNING OUTCOME", outcome)
//     return outcome
//   }

//   async done(data:any, params:any, almanac: any, result: any): Promise<any> {

//     const condition = await this.findAndAddCondition(data, result.conditions);
//     almanac.addRuntimeFact(this.OUTCOME, params)
//     return await super.done(data, params, almanac, result)
//   }
  
// }


// export class PolesToPercentageRetrospectiveMixin extends BaseMixin implements SchemeMixin {

//   async outcome(data:InputData, scheme: string):Promise<any> {

//     const outcome  = (await super.outcome(data, scheme)) || {}

//     const bonusOrderPoles = outcome.value * data.order.poles
//     const bonusTotalPoles = outcome.value * data.sales.poles

//     const p: any = await DB.PRODUCT.find(Product.ID_FIELD, outcome.item)
    
//     if (p) {

//       outcome.poles      = bonusOrderPoles
//       outcome.totalPoles = bonusTotalPoles
      
//       const orderDiscount = Number(p[Product.RATE_FIELD]) * bonusOrderPoles
//       const totalDiscount = Number(p[Product.RATE_FIELD]) * bonusTotalPoles

//       const netDiscount   = totalDiscount - data.order.families.reduce((d, f) => {
//         return d + ((data.sales.family[f] || {}).discount || 0)
//       }, 0) 
      
//       //console.log("Bonus Poles", bonusTotalPoles, "OD", orderDiscount, "TD", totalDiscount, "ND", netDiscount);

//       outcome[this.DISCOUNT]  = {
//         value: netDiscount,
//         percent: (netDiscount * 100)/ data.order.total 
//       }

//       // if (outcome[this.DISCOUNT].percent >= 30) {
//       //   outcome[this.DISCOUNT].percent = 30
//       //   outcome[this.DISCOUNT].value   = data.order.total * 0.3
//       // }

//     }

//     data.meta[scheme].outcome = Object.assign({}, outcome)

//     console.log("RETURNING OUTCOME", outcome)
//     return outcome
//   }

//   async done(data:any, params:any, almanac: any, result: any): Promise<any> {

//     // console.log("DONE = ", data, params, result)
    
//     const condition = await this.findAndAddCondition(data, result.conditions);
//     if (condition) {
//       almanac.addRuntimeFact(this.OUTCOME, params)
//     }
//     return await super.done(data, params, almanac, result)
//   }

//   async process(engine: any, data: any):Promise<any> {
//     console.log("IN PROCESS", data)
//     return super.process(engine, data)
//   }  
// }
