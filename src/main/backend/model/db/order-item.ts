
import Model from './model'

export default class OrderItem extends Model {
    
    static ID_FIELD = 'FLCVNB,ALCANB,ITEM,ORDDT2'

    static QTY_FIELD = 'ORDQTY'
    static RATE_FIELD = 'LP'
    static FAMILY_FIELD = 'JBADR0'
    static CODE_FIELD   = 'ITEM'
    static CUST_FIELD   = 'ALCANB'
    static DATE_FIELD   = 'TAX_SUF'
    static POLES_FIELD  = 'ORDPOL'

    static TOTAL_FIELD  = 'ORDLP'
    static NET_FIELD    = 'ORDNET'

    constructor(obj?:any) {
        super(obj)
        
    }

    static newInstance(obj?:any) {
        return new OrderItem(obj)           
    }    
    
}