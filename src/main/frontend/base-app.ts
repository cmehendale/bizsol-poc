// import fontawesome from '@fortawesome/fontawesome'
// import * as faUser from '@fortawesome/fontawesome-free-solid/faUser'
// fontawesome.library.add(faUser)

import {ROUTES} from '../shared/routes'
import {Router} from './router'

import * as moment from 'moment';

export const riot:any = require('riot');


import { Service, Api } from './base-service'

export class Application {

    private _router   !: Router
    private _service  !: Service

    public moment = moment

    constructor(opts:any) {
        // window.document.body.onload = ()=> {
            this.init(opts)
        // }
    }

    init(opts:any):any {

        riot.observable(this)

        this.initApi()

        this.initRoutes()
        this.initNav()

        this.viewHandler(opts.riot.view, opts.riot.params)
    }

    initNav() {
        document.addEventListener('click', (event:any)=> {
            const a:any = event.target.closest('a')
            if (!a || a.hash == '') return true

            event.preventDefault()
            event.stopPropagation()

            this.go(a.hash.substr(1))
            return false
        })
    }

    initService():Service {
        return new Service()
    }

    initRouter():any {
        return new Router({pushState:true})
    }

    initRoutes(): any {

        const routeHandler = ((route:any)=> {
            this._router.route({
                ...route,
                handler : this.viewHandler.bind(this),
            })
        })

        this._router = this.initRouter()
        ROUTES.forEach(routeHandler)
    }

    viewHandler(name:string, req:any) {
        riot.mount("#view", name, { ...(req.params), app:this})
    }

    go(path:string) {
        return this._router.go(path)
    }

    initApi() {

        const handleApi = (api:Api) => {

            const succ = api.success || `${api.name}:done`
            const err  = api.error   || 'api:error'

            const handler = async (data:any)=> {

                try {
                    const response = await api.handle(data)
                    return (this as any).trigger(succ, response.data)
                } catch (all) {
                    return (this as any).trigger(err, all)
                }

            }

            (this as any).on(api.name, handler)
        }

        this._service = this.initService()
        this._service.apis.forEach(handleApi)
    }

    async api(name:string, params:any):Promise<any> {
        console.log("Called Api", name)
        return (await this._service.api(name).handle(params))
    }

    async data(name:string, params:any):Promise<any> {
        console.log("Called data", name)
        return (await this.api(name, params)).data
    }

    get service() {
        return this._service;
    }

}