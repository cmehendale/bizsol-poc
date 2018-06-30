
const selectn = require('selectn')

export enum CustomEventType {
  EMIT_EVENT = "emit_event",
  LOOP_RESIDUAL = "loop_residual"
}

export const RESIDUAL_VALUE = "residual_value"
export const OUTCOME        = "outcome"

export async function safeFact<T>(almanac: any, name: string, defaultValue: T): Promise<T> {
  try {
    return await almanac.factValue(name);
  } catch (a) {
    return defaultValue;
  }
}

export async function matchedCondition(conditions: any): Promise<any> {
  return await (conditions.all || conditions.any) ?
    matchedCondition(conditions.all || conditions.any):
    conditions.find((c: any) => c.result);
}

