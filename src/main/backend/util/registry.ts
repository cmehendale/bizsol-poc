import * as Bonjour from 'bonjour';
//// import * as Promise from 'bluebird'
import { EventEmitter } from 'events';

import { Util, Config, Fn, Logger } from '../util';

const config = require('config');

const HTTP: string = 'http';

export class ServiceInfo {

  constructor(
    private readonly _name: string,
    private readonly proto: string, 
    private readonly host: string, 
    private readonly port: number) {}

  get name(): string { return this._name; }

  get url(): string {
    return `${this.proto}://${this.host}:${this.port}`;
  }

  get key(): string {
    return `${this.name}:${this.url}`
  }

  get opts(): any {
    // need probe:false to avoid a race condition error in unit testing
    return {     
      probe: false,
      type: HTTP,
      name: Util.uuid4(),
      host: this.host,
      port: this.port,
      txt: { name: this.name, proto: this.proto }
    }
  }

}

class ServiceEntry {
  idx: number;
  endpoints: string[];

  constructor() {
    this.idx = 0;
    this.endpoints = [];
  }

  find(url: string): { exists: boolean; idx: number } {
    const idx: number = this.endpoints.indexOf(url);
    return { exists: idx >= 0, idx: idx };
  }

  add(url: string) {
    const { exists, idx } = this.find(url);
    if (!exists) this.endpoints.push(url);
  }

  remove(url: string) {
    const { exists, idx } = this.find(url);
    if (idx >= 0) this.endpoints.splice(idx, 1);
  }

  next(): string | undefined {
    if (this.endpoints.length <= 0) return undefined;
    if (this.idx >= this.endpoints.length) this.idx = 0;
    return this.endpoints[this.idx++];
  }
}

class ServiceMap {

  published : Map<string, Bonjour.Service> = new Map<string, Bonjour.Service>();
  entries   : Map<string, ServiceEntry> = new Map<string, ServiceEntry>();

  makeKey(name: string, url: string): string {
    return `${name}:${url}`;
  }

  next(name: string): string | undefined {
    const entry: ServiceEntry | undefined = this.entries.get(name);
    return entry ? entry.next() : undefined;
  }

  async publish(svc: ServiceInfo, service: Bonjour.Service): Promise<void> {
    this.published.set(svc.key, service);
  }

  async unpublish(svc: ServiceInfo): Promise<void> {
    const service: Bonjour.Service | undefined = this.published.get(svc.key);
    await this.stop(service)
    this.published.delete(svc.key);
  }

  async stop(service: Bonjour.Service | undefined): Promise<any> {
    return await new Promise((resolve, reject) => {
      if (service) return service.stop(resolve);
      resolve();
    });
  }

  activate(svc:ServiceInfo): void {
    let entry = this.entries.get(svc.name) || new ServiceEntry();
    entry.add(svc.url);
    this.entries.set(svc.name, entry);
  }

  deactivate(svc:ServiceInfo): void {
    let entry = this.entries.get(svc.name);
    if (entry) {
      entry.remove(svc.url);
      this.entries.set(svc.name, entry);
    }
  }

  async clear(): Promise<any> {
    this.entries.clear();
    const promises = [];
    for (let k in this.published) {
      promises.push(this.stop(this.published.get(k)));
    }
    return await Promise.all(promises);
  }
}

export class Registry {

  private emitter: EventEmitter = new EventEmitter();
  private serviceMap: ServiceMap = new ServiceMap();

  private name: string;
  private timeout: number;
//  private logger: any;
  private bonjour!: Bonjour.Bonjour;
  private browser!: Bonjour.Browser;

  constructor(name?: string) {
    
    this.name = name || Config.registryName()
    this.timeout = Config.registryTimeout(3000) // config.has('registry.timeout') ? config.get('registry.timeout'): this.timeout
    
    // Logger = bunyan.createLogger({
    //   name: this.name
    // } as bunyan.LoggerOptions);
  }

  init(opts?: Bonjour.BonjourOptions): Registry {
    this.bonjour = Bonjour(opts);
    this.browser = this.bonjour.find({ type: HTTP });
    this.browser.on('up',   this.up.bind(this));
    this.browser.on('down', this.down.bind(this));
    return this;
  }

  async clear(): Promise<any> {
    return await this.serviceMap.clear();
  }

  publish(svc: ServiceInfo): Registry {
    
    if (!this.bonjour)
      throw new Error('Bonjour not started - please call init() first');

    const service = this.bonjour.publish(svc.opts);
    this.serviceMap.publish(svc, service);

    Logger.debug(this.name, {}, `${this.name} (${svc.name}) PUBLISHED [${svc.name}] @ ${svc.url}`);
    return this;
  }

  async unpublish(svc: ServiceInfo): Promise<void> {
    await this.serviceMap.unpublish(svc)
    Logger.debug(this.name, {}, `(${svc.name}) UNPUBLISHED [${svc.name}] @ ${svc.url}`);
  }

  // clearTimeout(id: any): void {
  //   clearTimeout(id);
  // }

  // setTimeout(id: string, reject: Fn) {
  //   return setTimeout(() => {
  //     reject(
  //       new Error(`Cannot find service [${id}]. Timeout = ${this.timeout}`)
  //     );
  //   }, this.timeout);
  // }

  async waitFor(id:string):Promise<string> {
    
    return await new Promise<string>((resolve, reject) => {
      
      const tout: any = setTimeout(()=> {
        reject(new Error(`Cannot find service [${id}]. Timeout = ${this.timeout}`));
      }, this.timeout);

      this.emitter.once(`ADD - ${id}`, () => {
        clearTimeout(tout);
        resolve(this.find(id));
      });
    });
  
  }

  async findOrWait(id: string): Promise<string> {
    return this.find(id) || (await this.waitFor(id))

  }
    // const url = this.find(id);
    // if (url) return Promise.resolve(url);
    // return new Promise<string>((resolve, reject) => {
    //   const tout: any = this.setTimeout(id, reject);
    //   this.emitter.once(`ADD - ${id}`, () => {
    //     this.clearTimeout(tout);
    //     resolve(this.find(id));
    //   });
    // });
  //}

  find(name: string): string | undefined {
    return this.serviceMap.next(name);
  }

  add(svc:ServiceInfo) {
    Logger.debug(this.name, {}, `${this.name} ADD - ${svc.name}: ${svc.url}`);
    this.serviceMap.activate(svc);
    this.emitter.emit(`ADD - ${svc.name}`);
  }

  del(svc:ServiceInfo) {
    Logger.debug(this.name, {}, `${this.name} DEL - ${svc.name}: ${svc.url}`);
    this.serviceMap.deactivate(svc);
    this.emitter.emit(`DEL - ${svc.name}`);
  }

  up(options: object | any): void {
    const svc = new ServiceInfo(options.txt.name, options.txt.proto, options.host, options.port);
    this.add(svc);
  }

  down(options: object | any): void {
    const svc = new ServiceInfo(options.txt.name, options.txt.proto, options.host, options.port);
    this.del(svc);
  }

  destroy(): void {
    this.browser.stop();
    this.bonjour.destroy();
  }
}
