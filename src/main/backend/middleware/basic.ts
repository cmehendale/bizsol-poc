
import * as bunyan from "bunyan";
import * as uuid from "uuid";
import * as E from 'express';
import {HEADERS, Logger, Timer} from '../util'

const bunyanMW = require("bunyan-middleware");
const stringify = require('json-stringify-pretty-compact')

export function trace(name:string): E.RequestHandler {
    return ( req: E.Request, res: E.Response, next: E.NextFunction): any => {
      
      (req as any).traceId = req.headers[HEADERS.X_TRACE_ID] || uuid.v4();
      
      (res as any).logger = Logger.logger(name).child({
        trace_id: (req as any).traceId
      });
      
      next();
    };
  }

export function tenant(): E.RequestHandler {
    return (req: E.Request, res: E.Response, next: E.NextFunction): any => {
      (req as any).tenantId = req.headers[HEADERS.X_TENANT_ID];
      next();
    };
  }

export function access(): E.RequestHandler {
    return (req: E.Request, res: E.Response, next: E.NextFunction): any => {
      (req as any).accessToken =
        req.headers[HEADERS.X_ACCESS_TOKEN] ||
        req.cookies[HEADERS.X_ACCESS_TOKEN];
        next()
    };
  }

export function logger(name:string): E.RequestHandler {
    const opts = {
      headerName: HEADERS.X_TRACE_ID,
      propertyName: "traceId",
      logName: "trace_id",
      logger: Logger.logger(name),
      level: "info"
    };

    return bunyanMW(opts);
}

export function TIMER(req: E.Request, res: E.Response, next: E.NextFunction): any {
    try {
      if ((req as any).timer) { 
        console.log(stringify(((req as any).timer).stop().result(), {maxLength:400}))
      } else { 
        (req as any).timer = Timer.start(req.path)
      }
    } finally {
      next()
    }
}