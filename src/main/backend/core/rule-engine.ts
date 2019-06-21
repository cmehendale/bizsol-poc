import Engine from "../model/json-rules";
import {comboSum} from '../model/json-rules/util'

// import { strategies } from "../model/strategies";
// import { actions } from "../model/actions";

//import {moment } from "moment";

import DB from "../model/db";
import Scheme from "../model/db/scheme";

const minimist = require("minimist");
// import { ResidualMixin, PercentageToFreebiesMixin } from "./scheme-mixin";
import OrderItem from "backend/model/db/order-item";
import { createInputData, InputData } from "backend/model/order-data";
import Customer from "backend/model/db/customer";

import * as handlers from "./scheme-handlers";
import { matchedCondition, safeFact } from "backend/core/event-util";
// import { schemeDB } from "backend/model/schemes";


enum EVENTS {
  EMIT = "emit",
  DONE = "done",
  CONTINUE = "continue"
}

enum FACTS {
  OUTCOME = "outcome",
  SALES = "sales",
  ORDER = "order",
  POLES = "poles",
  TOTAL = "total",
  RESIDUE = "residue"
}

export class RuleEngine {
  constructor() {}

  async findEligibleSchemes(data: InputData): Promise<Scheme[]> {
    const schemeList: Scheme[] = await DB.SCHEME.find_all();
    const schemeMap: any = schemeList.reduce((map: any, s: Scheme): any => {
      map[s.id] = s;
      return map;
    }, {});

    const engine = Engine();
    const rules: Promise<any>[] = schemeList.map(s =>
      engine.addRule(s.eligibility)
    );
    await Promise.all(rules);

    const result = await engine.run(data);
    return result
      .filter((e: any) => e.type == "done")
      .map((e: any) => schemeMap[e.params.id]);
  }

  async calculateBenefits(data: InputData, eligible: Scheme[]): Promise<any> {
    const onEmit = (engine: any, data: InputData) => {
      return async (params: any, almanac: any, result: any) => {
        const condition: any = await matchedCondition(result.conditions);
        const outcome: any = await safeFact(almanac, FACTS.OUTCOME, {});
        outcome.conditions = outcome.conditions || [];

        if (condition) {
          outcome.conditions.push(condition);
          almanac.addRuntimeFact(FACTS.OUTCOME, outcome);
          if (condition.event) {
            const ee: any = condition.event as any;
            ee.params.condition = condition;
            engine.emit(ee.type, ee.params, almanac, result);
          }
        }
      };
    };

    // const residueObj = (data:any, item:any) => {
    //   if (!data) return data

    //   data.total = (data.total || 0) - item.total
    //   data.poles = (item.poles || 0) - item.poles
    //   data.qty   = (item.qty   || 0) - item.qty

    //   return data
    // }

    // const calculateResidue = (residue: any, condition: any) => {
    //   const item  = {
    //     value : (condition.value || 0),
    //     poles : (condition.poles || 0),
    //     qty   : (condition.qty   || 0)
    //   }

    //   residue = residueObj(residue, item)
    //   residue.family
    //   // residue.total = (residue.total || 0) - value
    //   // residue.poles = (residue.poles || 0) - poles
    //   // residue.qty   = (residue.qty || 0)   - qty



    // }

    const onContinue = (engine: any, data: InputData) => {
      return async (params: any, almanac: any, result: any) => {
        const outcome: any = await safeFact(almanac, FACTS.OUTCOME, {});
        const outcomeForId = outcome[params.id] || {};

        outcome[params.id] = {
          value: (outcomeForId.value || 0) + params.value,
          count: (outcomeForId.count || 0) + (params.count || 0)
        };

        const residue: any = await safeFact(almanac, FACTS.RESIDUE, {})
        residue.total = (residue.total || 0) - params.condition.value
        residue.poles = (residue.poles || 0) - params.condition.poles
        residue.qty   = (residue.qty || 0)   - params.condition.qty

        setTimeout(async () => {
          engine.addFact(FACTS.OUTCOME, outcome)
          engine.addFact(FACTS.RESIDUE, residue)
          await engine.run(data);
        });
      };
    };

    const onDone = (
      engine: any,
      data: InputData,
      resolve: Function,
      reject: Function
    ) => {
      return async (params: any, almanac: any, result: any) => {
        try {
          const handler = (handlers as any)[params.handler];
          let outcome: any = await safeFact(almanac, FACTS.OUTCOME, {});

          if (handler)
            outcome = await handler(engine, data)(outcome, params);

          const scheme: any = await DB.SCHEME.find(Scheme.ID_FIELD, params.id)
          scheme.outcome = outcome
          resolve(scheme);
        } catch (a) {
          reject(a);
        }
      };
    };

    const initResidue = (scheme: Scheme, data:InputData) => {
      const residue = Object.assign({}, data.sales)
      if (scheme.residue) {
        const fact   = scheme.residue.fact
        const path   = scheme.residue.path
        const value  = scheme.residue.value

        const keys = Object.keys(value || {});
        for (let ii = 0; ii < keys.length; ii++) {
          (residue as any)[keys[ii]] = comboSum(((data as any)[fact] || {})[path], value[keys[ii]])
        }
      }
      return residue
    }

    const calcBenefits = async (scheme: Scheme): Promise<any> => {
      const engine = Engine();
      const rules = scheme.benefits.map((b: any) => engine.addRule(b));
      await Promise.all(rules);

      engine.on(EVENTS.EMIT, onEmit(engine, data));
      engine.on(EVENTS.CONTINUE, onContinue(engine, data));

      return new Promise((resolve, reject) => {
        engine.on(EVENTS.DONE, onDone(engine, data, resolve, reject));
        engine.addFact(FACTS.OUTCOME, {});
        engine.addFact(FACTS.RESIDUE, initResidue(scheme, data)) //Object.assign({}, data.sales))
        engine.run(data);
      });
    };

    const benefits: Promise<any>[] = eligible.map(calcBenefits);
    return await Promise.all(benefits);
  }

  async createInputData(customer: Customer, orderItems: OrderItem[]) {
    const filtr = (item: any) => {
      return item[OrderItem.CUST_FIELD] == (customer as any)[Customer.ID_FIELD];
    };

    const salesItems = await DB.ORDER_ITEM.find_all(filtr);
    return await createInputData(orderItems, salesItems);
  }

  async execute(customer: Customer, orderItems: OrderItem[]) {
    const inputData = await this.createInputData(customer, orderItems);
    console.log("Sales", inputData.sales)
    console.log("Order", inputData.order)

    const eligibleSchemes = await this.findEligibleSchemes(inputData);
    console.log("Eligible", eligibleSchemes);
    const benefits = await this.calculateBenefits(inputData, eligibleSchemes);
    //console.log("BENEFITS", benefits)
    return benefits
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
