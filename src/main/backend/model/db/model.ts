
export default class Model {    

    static ID_FIELD:any

    constructor(obj?:any) {
        if (obj) Object.assign(this, obj)    
    }

    ID():any {
        return (this as any)[(this.constructor as any).ID_FIELD]
    }

    get IDVAL(): any {
        return this.ID()
    }
}