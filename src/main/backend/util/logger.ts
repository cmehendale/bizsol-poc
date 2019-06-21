
import {Config} from '.'
import * as bunyan from 'bunyan'

export class Logger {

    static loggers:any = {}

    static logger(name:string): bunyan {        
        return this.loggers[name] || 
               (this.loggers[name] = bunyan.createLogger(Config.logOptions({name})))
    }

    static info(name: string, ...args:any[]): void {
        return this.logger(name).info(args)
    }

    static debug(name: string, ...args:any[]): void {
        return this.logger(name).debug(args)
    }

}