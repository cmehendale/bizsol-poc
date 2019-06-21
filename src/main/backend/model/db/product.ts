
import Model from './model'

export default class Product extends Model {

    static ID_FIELD = 'ITNBR'
    static FAMILY_FIELD = 'JBADR0'
		static RATE_FIELD = 'NET'
		static LIST_PRICE = 'PLIBP'
    static DESC_FIELD = 'ITDSC'
    static CODE_FIELD = 'CODE'
    static POLES_FIELD = 'NUMPOL'

    static newInstance(obj?:any) {
        return new Product(obj)
    }

}