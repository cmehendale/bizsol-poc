
import Model from './model'

export default class Customer extends Model {
    
    static ID_FIELD = 'DECANB'
    static NAME_FIELD = 'ALCLTX'


    static newInstance(obj?:any) {
        return new Customer(obj)           
    }
    
}