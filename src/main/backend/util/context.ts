import { Util } from './util';

export interface IContext {
  readonly accessToken: string;
  readonly traceId: string;
  readonly tenantId: string;
  readonly logger: any;
  readonly user: any;
  readonly meta: any;

  extend(obj: IContext): IContext;
}

export class Context implements IContext {
  public readonly accessToken!: string;
  public readonly traceId!: string;
  public readonly tenantId!: string;
  public readonly logger: any;
  public readonly user: any;
  public readonly meta: any;

  constructor(opts?: any, meta?: any) {
    if (opts) {
      this.accessToken = opts.accessToken;
      this.traceId = opts.traceId;
      this.tenantId = opts.tenantId;
      this.logger = opts.logger;
      this.user = opts.user;
    }
    this.meta = meta || {};
  }

  // _extend(one:any, two:any):any {
  // 	const opts:any = Object.keys(one).reduce((obj:any, key:string, idx:number, keys:string[]):any => {
  // 		let val = (one as any)[key]
  // 		if (typeof val === 'object' && two[key]) {
  // 			val = _.extend(one, two[key])
  // 		}
  // 		//if (key != 'meta' &&  val != undefined) obj[key] = val
  // 	}, two)

  // 	const meta:any = Object.keys(ctx.meta).reduce((obj:any, key:string, idx:number, keys:string[]):any => {
  // 		const val = (ctx as any)[key]
  // 		if (val != undefined) obj[key] = val
  // 	}, {})

  // 	opts.meta = meta

  // }

  extend(ctx: IContext): IContext {
    return new Context(Util.extend(this, ctx));
  }
}
