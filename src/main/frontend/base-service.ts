
const axios = require('axios')

export class Api {
    constructor(private _name:string, private _api:any, 
        private _success:string = _name, private _error:string = 'error') {}

    get name()    { return this._name    }
    get success() { return this._success }
    get error()   { return this._error   }
    get api() { return this._api }
    
    async handle(params:any):Promise<any> {
        return await this._api(params)
    }
}

export class Service {

    _apis   !: Api[]
    _apiMap !: Map<string, Api>

    constructor() {
        this._apis = this.initApis()
        this.setupApis()
    }

    initApis(): Api[] {
        return [
            new Api('hello:world', this.hello.bind(this))
        ]
    }

    setupApis(): void {
        this._apiMap = this._apis.reduce((map: Map<string, Api>, h:Api):Map<string, Api> => {
            return map.set(h.name, h)
        }, new Map<string, Api>())
    }

    async hello(params:any) {
        return (await axios.get('api/hello')).data
    }

    api(name:string):Api {
        const api:Api|undefined = this._apiMap.get(name)
        if (!api) throw new Error(`Api '${name}' not found`)
        return api
    }    

    get apis() {
        return this._apis
    }

    makeQS(uri:string, params:any): string { 
        if (!params || Object.keys(params).length <= 0) return uri

        return [uri, params.reduce((arr:any[], v:any, k:string) => {
			if (v) arr.push([encodeURIComponent(k), encodeURIComponent(v)].join('='))
			return arr
		}, []).join('&')].join('?')
    }

    async get(uri:string, params:any = null, headers:any = null): Promise<any> {
        console.log("Called get", uri)        

        const url = this.makeQS(uri, params);
        return (await axios.get(url))
    }

    async post(uri:string, data:any = null, headers:any = null): Promise<any> {
        return (await axios.post(uri, data))
    }

}