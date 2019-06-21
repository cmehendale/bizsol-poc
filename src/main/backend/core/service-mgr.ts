import { Service2 } from "./service2";
import {Config, SERVICE, Fn, Registry, ServiceInfo, Logger} from '../util';
import {EventEmitter} from 'events'

const httpShutdown = require("http-shutdown");

export class ServiceMgr {

  name     : string;
  state    : SERVICE.STATE = SERVICE.STATE.CREATED;
  server   : any;
  registry : Registry;
  svc      : ServiceInfo;
  port     : number;
  emitter  : EventEmitter = new EventEmitter();


  constructor(private service: Service2) {
    this.name     = service.name
    this.registry = new Registry().init()
    this.port     = Config.port(3000)
    this.svc      = new ServiceInfo(service.name, Config.proto('http'), 
                                    Config.host('localhost'), this.port)
  }

  async onExit(status: number, signal: string, onClose?: Fn): Promise<void> {

    const msg = `STOPPED [${this.svc.name}] @ ${this.svc.url} -- Exit Status - ${status}: ${signal}`

    console.log(msg);
    Logger.info(this.name, {}, msg);

    if (this.state != SERVICE.STATE.RUNNING) return;

    try {
      await this.registry.unpublish(this.svc)
    } catch(err) {
      Logger.info(this.name, {}, `Couldn't unpublish service [${this.service.name}] - ${err.message}`)
    }

    await this.onShutdown(status, onClose);
  }

  async onShutdown(status: number, callback?: (status: number) => any):Promise<void> {

    if (this.state >= SERVICE.STATE.STOPPING) return;    
    this.state = SERVICE.STATE.STOPPING;

    const cb = ()=> {
      this.state = SERVICE.STATE.STOPPED;
      this.emitter.emit(SERVICE.STATE_EVENT, this.state);
      if (callback) callback.call(this, status);
    }

    this.server.shutdown(cb);
  }

  onClose(status: any):any {
    Logger.info(this.name, {}, `Exiting Process - ${status}`);
    process.exit(status);
  }

  onExitListeners(): void {
    process.on("SIGTERM", () => this.onExit(0, "SIGTERM", this.onClose));
    process.on("SIGINT", () => this.onExit(0, "SIGINT", this.onClose));
    process.on("exit", () => this.onExit(0, "EXIT", this.onClose));
    process.on("uncaughtException", e => console.log("EEEE", e.stack ));
//    process.on("uncaughtException", e => this.onExit(1, `${e}`, this.onClose));
  }

  async onReady() {
    this.state = SERVICE.STATE.RUNNING;
    Logger.debug(this.name, {}, `EMITTING - ${this.state}`);
    this.emitter.emit(SERVICE.STATE_EVENT, SERVICE.STATE.RUNNING);

    return await this.registry.publish(this.svc).findOrWait(this.service.name);
  }

  async onStart(): Promise<void> {
    const msg = `STARTED [${this.svc.name}] @ ${this.svc.url}`
    console.log(msg);
    Logger.info(this.name, {}, msg);
    this.onExitListeners();

    await this.service.ready()
    await this.onReady();
  }

  async start(app:any): Promise<Service2> {

      if (this.state >= SERVICE.STATE.STARTING) return await this.service;

      this.state  = SERVICE.STATE.STARTING;   
      this.server = app.listen(this.port, ()=> { this.onStart() })
      this.server = httpShutdown(this.server);
    
      // console.log("STARTED LISTENING", this.port)
      return await this.service;
  }

  stop(): Promise<Service2> {
    this.onExit(0, "STOP");
    return Promise.resolve(this.service);
  }

  async waitFor(state: SERVICE.STATE): Promise<Service2> {
    await this.service.ready()    
    
    return await new Promise<Service2>((resolve, reject) => {
        if (this.state >= state) {
          Logger.debug(this.name, `ON STATE - ${state}`);
          resolve(this.service);
        } else {
          this.emitter.once(SERVICE.STATE_EVENT, (state) => {
            Logger.debug(this.name, `ON STATE - ${state}`);
            resolve(this.service);
          });
        }
      });
  }
}
