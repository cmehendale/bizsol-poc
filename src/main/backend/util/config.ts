const config = require('config')

export class Config {

    public static readonly SERVICE_NAME    = 'service.name';
    public static readonly SERVICE_GROUP   = 'service.group';
    public static readonly SERVICE_PROTO   = 'service.proto';
    public static readonly SERVICE_HOST    = 'service.host';
    public static readonly SERVICE_PORT    = 'service.port';
    public static readonly SERVICE_TENANT  = 'service.tenant';

    public static readonly VIEW_DIR        = 'view.dir';
    public static readonly TAG_DIR         = 'tag.dir';
    public static readonly LOG_OPTIONS     = 'log.options'

    public static readonly REGISTRY_NAME      = 'registry.name'; 
    public static readonly REGISTRY_TIMEOUT   = 'registry.name'; 

    static value<T> (name:string, val:T): T {
        return (config.has(name) ? (<T> config.get(name)) : val);
    }

    static service (name:string, group:string): string {
        return `${this.value(this.SERVICE_NAME, name)}.${this.value(this.SERVICE_GROUP, group)}`;
    }

    static proto(proto:string): string {
        return this.value(this.SERVICE_PROTO, proto)
    }
    static host(host:string): string {
        return this.value(this.SERVICE_HOST, host)
    }
    static port(port:number): number {
        return this.value(this.SERVICE_PORT, port)
    }

    static tenant(tenant:string): string {
        return this.value(this.SERVICE_TENANT, tenant)
    }

    static logOptions(options:any):any {
        return this.value(this.LOG_OPTIONS, options)
    }

    static viewDir(defaultViewDir:string[] ): string[] {
        return this.value(this.VIEW_DIR, defaultViewDir)
    }

    static tagDir(defaultTagDir:string[] ): string[] {
        return this.value(this.TAG_DIR, defaultTagDir)
    }

    static registryName():string {
        return this.value(this.REGISTRY_NAME, 'base.registry')
    }

    static registryTimeout(timeout:number):number {
        return this.value(this.REGISTRY_TIMEOUT, timeout || 3000)
    }
    
}