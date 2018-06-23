export enum CustomEventType {
  EMIT_EVENT = "emit_event",
  LOOP_RESIDUAL = "loop_residual"
}

export const RESIDUAL_VALUE = "residual_value"
export const OUTCOME        = "outcome"

export async function safeFact<T>(
  almanac: any,
  name: string,
  defaultValue: T
): Promise<T> {
  try {
    return await almanac.factValue(name);
  } catch (a) {
    return defaultValue;
  }
}

export async function findMatchedCondition(conditions: any): Promise<any> {
  const recurse = conditions.all || conditions.any;
  if (recurse) return await findMatchedCondition(recurse);

  return conditions.find((c: any) => c.result);
}

// export function emit_event(engine: any) {
//   return async (type: string, almanac: any, result: any): Promise<any> => {
//     const condition: any = await findMatchedCondition(result.conditions);
//     if (condition.event) {
//       const ee: any = condition.event as any;
//       engine.emit(ee.type, ee.params, almanac, result);
//     }
//   };
// }

// export async function loop_residual(engine: any, init_facts:any) {
    
//   return async (type: string, almanac: any, result: any): Promise<any> => {

//       const condition = await findMatchedCondition(result.conditions)
//       if (!condition) return 
			
// 			const residual = await safeFact(almanac, RESIDUAL_VALUE, 0) - (condition.value || 0)
// 			const outcome  = await safeFact(almanac, OUTCOME, 0) + (condition.outcome || 0)
//       const count    = await safeFact(almanac, (condition.id || 'count'), 0)

// 			setTimeout(async () => {
				
//         // await engine.addFact(RESIDUE, residue)
// 				await engine.addFact(OUTCOME, outcome)
        
// 				if (condition.id) await engine.addFact(condition.id,  count)
//         init_facts[ORDER_VALUE] = order_value

//         await engine.run(init_facts)
        
// 			})
      
//     };
//   }
  

// export const CustomEventMap = {
//   EMIT_EVENT: emit_event,
//   LOOP_RESIDUAL: loop_residual,
// };
