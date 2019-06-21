// import * as express from "express";

import {ReqHandler, ErrHandler} from '../util'

export class HookMgr {
  // service: Service2;
  hooks: Map<string, ReqHandler|ErrHandler>;

  constructor() {
    this.hooks = new Map<string, ReqHandler|ErrHandler>();
  }

  // excp(key: string): RawHandler {
  //   return (req: express.Request, res: express.Response) => {
  //     throw new NotFoundError(key);
  //   };
  // }

  // noop():RawHandler {
  // 	return (req:express.Request, res:express.Response) => {
  // 		return (res as any).result
  // 	}
  // }

  makeKey(keys: string[]): string {
    return keys.map(k => k.trim()).join(" ");
  }

  find(keys: string[]): ReqHandler | ErrHandler | undefined {
    let key = this.makeKey(keys);
    let hook: ReqHandler | ErrHandler | undefined;
    
    while (key.trim().length > 0) {
      hook = this.hooks.get(key);
      if (hook) break;
      key = this.makeKey((keys = keys.slice(0, -1)));
    }

    return hook;
  }

  get(keys: string[]): ReqHandler | ErrHandler | undefined {
    return this.find(keys)
  }

  add(keys: string[], cb: ReqHandler | ErrHandler): void {
    if (!cb) throw new Error("Callback must be defined");
    this.hooks.set(this.makeKey(keys), cb);
  }
}
  // exec(
  //   keys: string[]
  // ): (
  //   req: express.Request,
  //   res: express.Response,
  //   mandatory?: boolean
  // ) => Promise<any> {
  //   return (
  //     req: express.Request,
  //     res: express.Response,
  //     mandatory?: boolean
  //   ): Promise<any> => {
  //     const hook: RawHandler = this.get(keys, mandatory);
  //     return Promise.resolve((hook as RawRequestHandler)(req, res));
  //   };
  // }

//   error(
//     keys: string[]
//   ): (error: any, req: express.Request, res: express.Response) => Promise<any> {
//     return (
//       error: any,
//       req: express.Request,
//       res: express.Response
//     ): Promise<any> => {
//       const hook: RawHandler | undefined = this.find(keys);
//       if (hook)
//         return Promise.resolve((hook as RawErrorHandler)(error, req, res));
//       return Promise.reject(error);
//     };
//   }
// }
