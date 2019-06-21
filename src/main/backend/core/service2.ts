
import * as bodyParser from 'body-parser';
import * as bunyan from 'bunyan';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as E from 'express';

import { Server } from 'http';
import { EventEmitter } from 'events';

import {ROUTES} from 'shared/routes';

import * as path from 'path'

import * as moment from 'moment'

import { 
	HEADERS, SERVICE, Context, Util, Registry, ServiceInfo as RegistryService, 
	AuthenticationError, NotFoundError, Fn, Config, Logger, ReqHandler, ErrHandler,
	NOOP, ERROR, FINISH, RENDER, AUTH_ERROR, PROVIDERS, GenericError, 
} from 'backend/util';

import {
	trace, tenant, access, logger, TIMER
} from 'backend/middleware'

import {ServiceMgr } from './service-mgr'
import {HookMgr    } from './hook-mgr'

import {AuthMgr, NoopAuthMgr, Credentials} from './auth-mgr'

import { constants } from 'zlib';

export { E as express }
export { moment }

export class HtmlConfig {
	constructor(
		private readonly _name?: string,
		private readonly _viewDir?: string,
		private readonly _engine?: Fn
	) {}

	get name()    { return this._name;    }
	get viewDir() { return this._viewDir; }
	get engine()  { return this._engine;  }
}

export class ServiceConfig {

	constructor( 
		private _htmlConfig? : HtmlConfig,
		private _authMgr?    : AuthMgr
	) {}

	get authMgr()    { return this._authMgr;    }
	get htmlConfig() { return this._htmlConfig; }
}

export interface Service2 {

	name: string;
	state: SERVICE.STATE;

	init(cfg: ServiceConfig):Promise<Service2>;
	use(handler: E.RequestHandler): Promise<Service2>;

	start(): Promise<Service2>;
	stop(): Promise<Service2>;

	ready(): Promise<Service2>;
	waitFor(state:SERVICE.STATE): Promise<Service2>

}

export class BaseService2 implements Service2 {

	name : string;

	serviceMgr : ServiceMgr;
	hookMgr    : HookMgr;
	app        : E.Application;

	authMgr!   : AuthMgr;
	tagDirs!   : string[]

	constructor(name?:string) {
		this.name     = name || Config.service('base', 'base')
		this.serviceMgr    = this.initServiceMgr(); 		
		this.hookMgr       = this.initHookMgr();
		this.app = E();
	}

	async init(cfg:ServiceConfig):Promise<Service2> {

		this.authMgr = cfg.authMgr || this.initAuthMgr()
		this.initHtml(cfg.htmlConfig)
		this.tagDirs = this.resolveTagDirs();
		
		this.initMiddlewares();
		this.initRoutes();
		this.initHooks();
		this.initCustom();
		return this.bootstrap();
	}

	get state(): SERVICE.STATE {
		return this.serviceMgr.state;
	}

	initServiceMgr(): ServiceMgr {
		return new ServiceMgr(this);
	}

	initHookMgr(): HookMgr {
		return new HookMgr();
	}

	initAuthMgr(): AuthMgr {
		return new NoopAuthMgr();
	}
	
	// checkAuth(req: E.Request, res: E.Response): Promise<any> {
	// 	return this.authMgr
	// 		.checkAuth()(req, res)
	// 		.then((u: any) => {
	// 			(req as any).user = u;
	// 			return u;
	// 		});
	// }

	initMiddlewares() {

		this.use(trace(this.name));
		this.use(tenant());

		this.static();

		this.use(logger(this.name));

		this.use(cookieParser());
		this.use(cors());
		this.use(bodyParser.urlencoded({ extended: true }));
		this.use(bodyParser.json());

		// needs cookies so added later
		this.use(access());
	}

	testErr(req:E.Request, res:E.Response):any {
		throw new GenericError("SOME PROBLEM MAN!!!")
	}

	initStaticRoutes() {

		this.app.head('/',           this.onHeartbeat.bind(this));
		this.app.get('/me',          this.onMe.bind(this));
		this.app.get('/favicon.ico', this.onFavicon.bind(this));		

	}

	initPageRoutes() {
		ROUTES.forEach((route:any) => {
			this.app.get(route.path, this.wrap(route.path, this.onRiot(route.name).bind(this)))
		})
	}

	initApiRoutes() {
		
		this.app.get('/api/hello', this.wrap('/api/helloAPI', this.helloAPI.bind(this)))

		this.app
			.route('/authenticate/:provider')
			.get(this.authenticate.bind(this))
			.post(this.authenticate.bind(this));

		this.app.post(
			'/connect/:provider',
			this.connect.bind(this)
		);

		this.app.post(
			'/invalidate/:provider',
			this.invalidate.bind(this)
		);

		this.app.post(
			'/disconnect/:provider',
			this.disconnect.bind(this)
		);

		//this.app.get('/:page?', this.wrap('/:page?', this.index.bind(this)));
	}

	initRoutes() {
		this.initStaticRoutes();
		this.initPageRoutes();
		this.initApiRoutes();
	}

	initHooks() {
		this.hookMgr.add([SERVICE.AUTH], this.authenticate.bind(this));
	}

	initCustom() {}

	// setup related
	initHtml(cfg:HtmlConfig=new HtmlConfig()): void {
		
		if (!this.app) throw new Error("This must be called after app is initialized")

		this.app.set('view engine', cfg.name || 'pug');
		if (cfg.name && cfg.engine) this.app.engine(cfg.name, cfg.engine);

		let viewDirs = this.resolveViewDirs();
		if (cfg.viewDir) viewDirs = Util.flatten([cfg.viewDir].concat(viewDirs))

		this.app.set('views', viewDirs);
	}

	resolveViewDirs():string[] {
		// must give absolute path in Config
		return Config.viewDir([[__dirname, '..', 'view/templates'].join('/')])		
	}

	resolveTagDirs(): string[] {
		return Config.tagDir([path.normalize([__dirname, '..', "..", 'shared/tags'].join('/'))])				
	}

	static(): Service2 {
		this.app.use('/www', E.static([process.env.PWD, 'dist/www'].join('/')));
		return this;
	}

	async use(
		handler:
			| E.RequestHandler
			| E.ErrorRequestHandler
			| (E.RequestHandler | E.ErrorRequestHandler)[]
	): Promise<Service2> {
		this.app.use(handler);
		return await this;
	}

	async bootstrap(): Promise<Service2> {
		return await this
	}

	async ready(): Promise<Service2> {
		return await this;
	}

	start(): Promise<Service2> {
		// this.app.use(ERROR)
		return this.serviceMgr.start(this.app);
	}

	stop(): Promise<Service2> {
		return this.serviceMgr.stop();
	}

	waitFor(state: SERVICE.STATE): Promise<Service2> {
		return this.serviceMgr.waitFor(state);
	}

	// routes

	async onHeartbeat(req: E.Request, res: E.Response): Promise<any> {
		res.sendStatus(200);
	}

	async onFavicon(req: E.Request, res: E.Response): Promise<any> {
		res.sendStatus(204);
		return null;
	}

	async onMe(req: E.Request, res: E.Response): Promise<any> {
		res.header(HEADERS.X_ACCESS_TOKEN, new Context(req).accessToken);
		res.send((req as any).user);
	}


	// API
	async helloAPI(req: E.Request, res: E.Response): Promise<any> {
		return await {hello:'world'}
	}

	async connect(req: E.Request, res: E.Response): Promise<any> {
		return await this.authMgr.connect(req.params.provider,Credentials.fromReq(req))(req, res);
	}

	async authenticate(req: E.Request, res: E.Response): Promise<any> {
		(req as any).user = await this.authMgr.authenticate(req.params.provider, Credentials.fromReq(req))(req, res);
	}

	async anon(req: E.Request, res: E.Response): Promise<any> {
		(req as any).user = await this.authMgr.authenticate(PROVIDERS.ANON, Credentials.EMPTY)(req, res);
	}

	async invalidate(req: E.Request, res: E.Response): Promise<any> {
		await this.authMgr.invalidate(req.params.provider)(req, res);
	}

	async disconnect(req: E.Request, res: E.Response): Promise<any> {
		await this.authMgr.disconnect(req.params.provider)(req, res);
	}


	// PAGE

	onRiot(name:string) {
		return async (req: E.Request, res: E.Response): Promise<any> => {
			return { riot: { view: name, params: req.params } } 
		}
	}

	async index(req: E.Request, res: E.Response): Promise<any> {
		return { riot: { view: req.params.page || 'index', params: req.query } };
	}

	async login(req: E.Request, res: E.Response): Promise<any> {
		return { riot: { view: 'login', params: { r_url: req.query.r } } };
	}

	async signup(req: E.Request, res: E.Response): Promise<any> {
		return { riot: { view: 'signup', params: { r_url: req.query.r } } };
	}

	async prot(req: E.Request, res: E.Response): Promise<any> {
		return { riot: { view: 'prot' } };
	}

	wrap(name:string, handler:ReqHandler, authenticate?:boolean) {		
			
		const wrapped = (prefix:string, handler:ReqHandler) => {
			return async (req:E.Request, res:E.Response, next:E.NextFunction):Promise<any> => {
				try {
					const wrapper:ReqHandler = <ReqHandler> (this.hookMgr.get([prefix, name]) || handler);
					(res as any).result = await wrapper(req, res)
					next()
				} catch (err) {
					console.log("ERROR", err);
					(prefix == SERVICE.AUTH ? AUTH_ERROR : ERROR)(err, req, res)
				}
			}
		}

		const handlers:E.RequestHandler[] = authenticate ? [wrapped(SERVICE.AUTH, NOOP)]: [] 

		handlers.push(...[	
			TIMER,		
			wrapped(SERVICE.PRE, NOOP), 
			wrapped(SERVICE.EXEC, handler), 
			wrapped(SERVICE.POST, NOOP),
			wrapped(SERVICE.RENDER, RENDER({tagDirs:this.tagDirs})),
			TIMER,
			FINISH
		])
		
		return handlers
	}

}
