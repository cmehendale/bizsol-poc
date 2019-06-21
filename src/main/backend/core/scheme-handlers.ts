import { InputData } from "backend/model/order-data";
import DB from "backend/model/db";
import Product from "backend/model/db/product";
import { comboSum } from "backend/model/json-rules/util";

export function freebies(engine: any, data: InputData) {
  const calculateValue = async (key: any, past:any, params: any) => {
    const p: any = await DB.PRODUCT.find(Product.ID_FIELD, key);
    const rate = Number((p[Product.RATE_FIELD] || p[Product.LIST_PRICE]));
    const discount = params.value * rate;

    const fact  = past.fact
    const path  = past.path
    const value = past.value

    const keys = Object.keys(value || {});
    const pastData:any = {}
    for (let ii = 0; ii < keys.length; ii++) {
      pastData[keys[ii]] = comboSum(((data as any)[fact] || {})[path], value[keys[ii]])
    }

    const pastDiscount = pastData.discount
    // data.order.families.reduce((d, f) => {
    //   return d + ((data.sales.family[f] || {}).discount || 0);
    // }, 0)
    //pastData.discount || 0
    const pastQty      = pastDiscount > 0 ? Math.round(pastDiscount/rate) : 0
    let netDiscount  = discount - pastDiscount
    let netQty       = params.value - pastQty

    console.log("PAST", {pastDiscount, pastQty})
    console.log("CURR", {discount, qty: params.value})
    console.log("NETT", {netDiscount, qty: (params.value - pastQty)})

    // netDiscount  = netDiscount > 0 ? netDiscount: 0
    // netQty       = netQty > 0 ? netQty: 0

    return {
      qty: netQty,
      rate: rate,
      description: p[Product.DESC_FIELD],
      code: p[Product.CODE_FIELD],
      discount: netDiscount,
      past : pastDiscount,
      curr : discount,
      percent: Math.round((100 * 100 * netDiscount) / data.order.total) / 100
    };
  };

  return async (outcome: any, params: any) => {
    const itemsPromise = Object.keys(params.keys).map((k: any) => {
      return calculateValue(k, params.keys[k], outcome[k] || {});
    });
    outcome.items = await Promise.all(itemsPromise);
    outcome.discount = outcome.items.reduce(
      (discount: any, item: any) => {
        discount.value   += Math.round(item.discount);
        discount.percent += item.percent;
        discount.curr    += Math.round(item.curr);
        discount.past    += Math.round(item.past)
        return discount;
      },
      { value: 0, percent: 0, curr: 0, past: 0 }
    );
    return outcome;
  };
}

export function discount(engine: any, data: InputData) {
  return (outcome: any, params: any) => {
    outcome.discount = {
      value: Math.round((data.order.total * params[params.key]) / 100),
      percent: params[params.key]
    };
    return outcome;
  };
}

export function calcPastDiscount (data: InputData, families: any[]): number {
  return data.order.families.reduce((d, f) => {
    return d + (families.find((ff:any) => ff == f) ? ((data.sales.family[f] || {}).discount || 0): 0)
  }, 0)
}

export function percentage(engine: any, data: InputData) {
    return (outcome: any, params: any) => {

      const families = params.key.split('.')[0].split(',')

      const pastDiscount = calcPastDiscount(data, families)
      // data.order.families.reduce((d, f) => {
      //   return d + (families.find((ff:any) => ff == f) ? ((data.sales.family[f] || {}).discount || 0);
      // }, 0)

      const total = comboSum(data.sales.family, params.key)

      const discount = (total * params.value) / 100

      const netDiscount = discount - pastDiscount

      console.log("PAST", pastDiscount)
      console.log("CURR", discount)
      console.log("NETT", netDiscount)


      outcome.discount = {
        past : Math.round(pastDiscount),
        curr : Math.round(discount),
        value: Math.round(netDiscount), //(data.order.total * params.value) / 100,
        percent: 100 * netDiscount / data.order.total  //(params.value
      };
      return outcome;
    };
  }

export function poles(engine: any, data: InputData) {
  return async (outcome: any, params: any) => {

    const bonusOrderPoles = Math.round(params.value * data.order.poles);
    const bonusTotalPoles = Math.round(params.value * data.sales.poles);

    const p: any = await DB.PRODUCT.find(Product.ID_FIELD, params.key);

    if (p) {
      outcome.poles = bonusOrderPoles;
      outcome.totalPoles = bonusTotalPoles;
      outcome.items = {
        [params.key]: {
          qty: bonusTotalPoles,
          rate: (p[Product.RATE_FIELD] || p[Product.LIST_PRICE]),
          description: p[Product.DESC_FIELD],
          code: p[Product.CODE_FIELD]
        }
      }

      //const orderDiscount = Number((p[Product.RATE_FIELD] || p[Product.LIST_PRICE])) * bonusOrderPoles;
      const totalDiscount = Number((p[Product.RATE_FIELD] || p[Product.LIST_PRICE])) * bonusTotalPoles;
      const pastDiscount  = calcPastDiscount(data,params.families)
      // data.order.families.reduce((d, f) => {
      //   return d + ((data.sales.family[f] || {}).discount || 0);
      // }, 0)

      let netDiscount = totalDiscount - pastDiscount;

      console.log("PAST", pastDiscount)
      console.log("CURR", totalDiscount)
      console.log("NETT", netDiscount)

      //netDiscount  = netDiscount > 0 ? netDiscount: 0

      outcome.discount = {
        curr: Math.round(totalDiscount),
        past : Math.round(pastDiscount),
        value: Math.round(netDiscount),
        percent: (netDiscount * 100) / data.order.total
      };

      return outcome;
    }
  };
}

// export function residue(engine:any, data: InputData, meta: any) {

// }
