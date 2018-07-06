import { InputData } from "backend/model/order-data";
import DB from "backend/model/db";
import Product from "backend/model/db/product";
// export function residue(engine: any, data: InputData) {
//     return (params: any) => {}
// }

// const p: any = await DB.PRODUCT.find(Product.ID_FIELD, keys[ii])
// if (p) {
//   discount += outcome[keys[ii]] * p[Product.RATE_FIELD]
//   items[keys[ii]] = {
//     qty  : outcome[keys[ii]],
//     rate : Number(p[Product.RATE_FIELD]),
//     description: p[Product.DESC_FIELD],
//     code: p[Product.CODE_FIELD]
//   }
// }
// }

// outcome[this.DISCOUNT] = {
// value   : discount,
// percent : Math.round(100 * 100 * discount / data.order.total)/100
// }

export function freebies(engine: any, data: InputData) {
  const calculateValue = async (key: any, params: any) => {
    const p: any = await DB.PRODUCT.find(Product.ID_FIELD, key);
    const rate = Number(p[Product.RATE_FIELD]);
    const discount = params.value * rate;

    return {
      qty: params.value,
      rate: rate,
      description: p[Product.DESC_FIELD],
      code: p[Product.CODE_FIELD],
      discount: discount,
      percent: Math.round((100 * 100 * discount) / data.order.total) / 100
    };
  };

  return async (outcome: any, params: any) => {
    const itemsPromise = params.keys.map((k: any) => {
      return calculateValue(k, outcome[k] || {});
    });
    outcome.items = await Promise.all(itemsPromise);
    outcome.discount = outcome.items.reduce(
      (discount: any, item: any) => {
        discount.value += item.discount;
        discount.percent += item.percent;
        return discount;
      },
      { value: 0, percent: 0 }
    );
    return outcome;
  };
}

export function discount(engine: any, data: InputData) {
  return (outcome: any, params: any) => {
    outcome.discount = {
      value: (data.order.total * params[params.key]) / 100,
      percent: params[params.key]
    };
    return outcome;
  };
}

export function percentage(engine: any, data: InputData) {
    return (outcome: any, params: any) => {
      outcome.discount = {
        value: (data.order.total * params.value) / 100,
        percent: params.value
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
          rate: p[Product.RATE_FIELD],
          description: p[Product.DESC_FIELD],
          code: p[Product.CODE_FIELD]
        }
      }

      const orderDiscount = Number(p[Product.RATE_FIELD]) * bonusOrderPoles;
      const totalDiscount = Number(p[Product.RATE_FIELD]) * bonusTotalPoles;
      const pastDiscount  = data.order.families.reduce((d, f) => {
        return d + ((data.sales.family[f] || {}).discount || 0);
      }, 0) 

      const netDiscount = totalDiscount - pastDiscount;

      outcome.discount = {
        gross: totalDiscount,
        past : pastDiscount,
        value: netDiscount,
        percent: (netDiscount * 100) / data.order.total
      };

      return outcome;
    }
  };
}
