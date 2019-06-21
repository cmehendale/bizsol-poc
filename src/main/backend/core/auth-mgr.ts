import * as E from 'express';
import { Context, Util, ReqHandler, NOOP } from '../util';

export class Credentials {
  
  readonly id: string;
  readonly secret: string;

  static EMPTY = new Credentials('', '');

  constructor(id: string, secret: string) {
    this.id = id;
    this.secret = secret;
  }

  static fromReq(req: E.Request) {
    if (req.body) return new Credentials(req.body.id, req.body.secret);
    return this.EMPTY;
  }
}

export interface AuthMgr {
  
  current(ctx?:Context): ReqHandler;
  authenticate(provider:string, creds:Credentials, ctx?:Context): ReqHandler;
  invalidate(provider:string, ctx?:Context): ReqHandler;
  
  connect(provider:string, creds:Credentials, ctx?:Context): ReqHandler;
  disconnect(provider: string, ctx?: Context): ReqHandler ;
  
}

export class NoopAuthMgr implements AuthMgr {
  current(ctx?: Context | undefined): ReqHandler { return NOOP }
  authenticate(provider: string, creds: Credentials, ctx?: Context | undefined): ReqHandler { return NOOP }
  invalidate(provider: string, ctx?: Context | undefined): ReqHandler { return NOOP }
  connect(provider: string, creds: Credentials, ctx?: Context | undefined): ReqHandler { return NOOP }
  disconnect(provider: string, ctx?: Context | undefined): ReqHandler { return NOOP }
}