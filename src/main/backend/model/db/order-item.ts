
import Model from './model'

export default class OrderItem extends Model {
    
    static ID_FIELD = 'FLCVNB,ALCANB,ITEM,ORDDT2'

    static QTY_FIELD = 'COQTY'
    static RATE_FIELD = 'LP'
    static FAMILY_FIELD = 'Family'
    static CODE_FIELD   = 'ITEM'
    static CUST_FIELD   = 'ALCANB'
    static DATE_FIELD   = 'TAX_SUF'

    constructor(obj?:any) {
        super(obj)
        
    }

    static newInstance(obj?:any) {
        return new OrderItem(obj)           
    }    
    
}