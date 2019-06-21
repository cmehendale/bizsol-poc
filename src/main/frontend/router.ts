
const Grapnel = require('grapnel')

export class Router {

    private _grapnel : any

    constructor(opts:any = null) {
        this._grapnel = new Grapnel(opts)
    }

    route(route:any) {
        this._grapnel.get(route.path, (req:any) => {
            console.log("Handling", route.name, req)
            route.handler(route.name, req)
        })
    }

    go(path:string) {
        return this._grapnel.navigate(path)
    }
}