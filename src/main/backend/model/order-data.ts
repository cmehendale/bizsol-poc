import Product from "./db/product";
import OrderItem from "backend/model/db/order-item";
import {moment} from '@819/service-ts'

export class InputData {
  constructor(public order: ItemData, public sales: ItemData, public meta: any = {}) {}
}

export class ItemData {
  constructor(
    public total: number = 0,
    public qty: number = 0,
    public poles: number = 0,
    public discount: number = 0,
    public families: any[] = [],
    public combo: any = {},
    public month: { [key: string]: any } = {},
    public item: { [key: string]: any } = {},
    public family: { [key: string]: any } = {}
  ) {}
}

export async function createInputData(
  orderItems: OrderItem[],
  salesItems: OrderItem[]
): Promise<InputData> {

  const updateDataObj = (data: any, item: any):any => {

    data.total    += Number(item[OrderItem.TOTAL_FIELD] || '0')
    data.qty      += Number(item[OrderItem.QTY_FIELD] || '0')
    data.discount += item[OrderItem.NET_FIELD] ? (Number(item[OrderItem.TOTAL_FIELD] || '0') - Number(item[OrderItem.NET_FIELD] || '0')): 0 
    data. poles   += Number(item[OrderItem.POLES_FIELD] || '0')
    
    return data
  }

  const powerset = (array: any[]) => {
    const results = [[]];
    for (const value of array) {
      const copy = [...results]; 
      for (const prefix of copy) {
        results.push(prefix.concat(value));
      }
    }
    return results;
  };  
  
  const reduceOrderItems = (label: string) => {
    return (data: ItemData, item: any): ItemData => {
    
    const value =  Number(item[OrderItem.RATE_FIELD] || '0') * Number(item[OrderItem.QTY_FIELD] || '0'); 
    const netval = Number(item[OrderItem.NET_FIELD] || '-1');

    data.total    += value;
    data.discount += (value - (netval >= 0 ? netval: value))
    data.qty      += Number(item[OrderItem.QTY_FIELD])
    data.poles    += Number(item[OrderItem.POLES_FIELD] || '0')

    data.families = [...data.families.filter((f:any) => f != item[OrderItem.FAMILY_FIELD]), String(item[OrderItem.FAMILY_FIELD])]

    data.item[item[OrderItem.CODE_FIELD]]     = updateDataObj(data.item[item[OrderItem.CODE_FIELD]] || { total:0, discount:0, qty:0, poles: 0 }, item)
    const fly = String(item[OrderItem.FAMILY_FIELD])
    data.family[fly] = updateDataObj(data.family[fly] || { total:0, discount:0, qty:0, poles: 0 }, item)

    //if (label == 'order') console.log("RED", data.family, item)

    const MONTH =  moment(item[OrderItem.DATE_FIELD], 'DD/MM/YY').format('MMM')
    data.month[MONTH] = updateDataObj(data.month[MONTH] || { total:0, discount:0, qty:0, poles: 0 }, item)

    // console.log("Reducing", data)
    // console.log ('FAM', item[OrderItem.FAMILY_FIELD])

    return data;
  } 
  };

  const postProcessForFamilyCombo = (data: ItemData): ItemData => {

    const families = data.families.sort()
    const pSet = powerset(families)
    for (let ii = 0; ii < pSet.length; ii++) {
      const combo = pSet[ii]
      if (combo.length > 0) {
        const key = combo.join(',')
        data.combo[key] = combo.reduce((obj, f)=> { 
          obj.total    += (data.family[f] || {}).total || 0
          obj.discount += (data.family[f] || {}).discount || 0
          obj.qty      += (data.family[f] || {}).qty || 0
          obj.poles    += (data.family[f] || {}).poles || 0
          return obj
        }, {total:0, discount:0, qty:0, poles: 0})
      }
    }

    return data
  }

  const ip = new InputData(
    postProcessForFamilyCombo(orderItems.reduce(reduceOrderItems('order'), new ItemData())),
    postProcessForFamilyCombo(salesItems.reduce(reduceOrderItems('sales'), new ItemData()))
  );

  // console.log("Sales IP", ip.sales.families, ip.sales)
  // console.log("Order IP", ip.order.families, ip.order)
  return ip
}
