
import Model from './model'

export default class Strategy extends Model {
    
    static ID_FIELD = 'ID'

    static newInstance(obj?:any) {
        return new Strategy(obj)           
    }
    
}