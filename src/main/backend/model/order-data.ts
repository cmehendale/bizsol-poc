import Product from "./db/product";
import OrderItem from "backend/model/db/order-item";
import {moment} from '@819/service-ts'

export class InputData {
  constructor(public order: ItemData, public sales: ItemData, public meta: any = {}) {}
}

export class ItemData {
  constructor(
    public total: number = 0,
    public poles: number = 0,
    public families: any[] = [],
    public month: { [key: string]: number } = {},
    public item: { [key: string]: number } = {},
    public family: { [key: string]: number } = {}
  ) {}
}

export async function createInputData(
  orderItems: OrderItem[],
  salesItems: OrderItem[]
): Promise<InputData> {
  
  const reduceOrderItems = (data: ItemData, item: any): ItemData => {
    const value = item[OrderItem.RATE_FIELD] * item[OrderItem.QTY_FIELD];
    data.total += value;
    data.poles  = Number(item[OrderItem.POLES_FIELD] || '0')

    data.families = [...data.families.filter((f:any) => f !== item[OrderItem.FAMILY_FIELD]), item[OrderItem.FAMILY_FIELD]]

    data.item[item[OrderItem.CODE_FIELD]] =
      (data.item[item[OrderItem.CODE_FIELD]] || 0) + value;

    data.family[item[OrderItem.FAMILY_FIELD]] =
      (data.family[item[OrderItem.FAMILY_FIELD]] || 0) + value;

    const MONTH =  moment(item[OrderItem.DATE_FIELD], 'DD/MM/YY').format('MMM')
    data.month[MONTH] = (data.month[MONTH] || 0) + value;
      
    return data;
  };

  return new InputData(
    orderItems.reduce(reduceOrderItems, new ItemData()),
    salesItems.reduce(reduceOrderItems, new ItemData())
  );
}
