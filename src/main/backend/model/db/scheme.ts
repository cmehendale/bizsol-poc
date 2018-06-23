
import Model from './model'

export default class Scheme extends Model {
    
    static ID_FIELD = 'id'

    id:any
    eligibility: any
    benefits: any
    slab:any
    type:any

    static newInstance(obj?:any) {
        return new Scheme(obj)           
    }
    
}