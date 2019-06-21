// import * as requestP from 'request-promise-native'
// import * as request from 'request'

import axios from 'axios';

import { HEADERS } from './constants';
import { Context, IContext } from './context';

// import * as tough from 'tough-cookie'

const HEAD = 'HEAD';
const GET = 'GET';
const POST = 'POST';
const OPTIONS = 'OPTIONS';
const PUT = 'PUT';
const DELETE = 'DELETE';

// const DEFAULTS: requestP.RequestPromiseOptions = Object.assign({}, {
// 	simple                   : true,
// 	resolveWithFullResponse  : false,
// 	followRedirect           : true,
// 	followAllRedirects       : true,
// 	followOriginalHttpMethod : true,
// 	json                     : true,
// 	jar                      : true
// })

export class HTTP {
  // jar: tough.CookieJar

  // constructor() {
  // 	this.init()
  // }

  // init() {

  // 	// this.jar = new tough.CookieJar();

  // 	// axios.interceptors.request.use((config:AxiosRequestConfig) => {
  // 	// 	if (config.url) {
  // 	// 		this.jar.getCookies(config.url, (err, cookies) => {
  // 	// 			console.log("COOKIES = ", cookies)
  // 	// 			config.headers.cookie = cookies.join('; ');
  // 	// 		});
  // 	// 	}
  // 	// 	return config;
  // 	// });

  // 	// axios.interceptors.response.use((response:AxiosResponse) => {
  // 	// 	console.log("COOKIE IN RESP = ", response.headers[HEADERS.SET_COOKIE])
  // 	// 	if (response.headers[HEADERS.SET_COOKIE] instanceof Array) {
  // 	// 		response.headers[HEADERS.SET_COOKIE].forEach((c:string) => {
  // 	// 			const cookie = tough.Cookie.parse(c)
  // 	// 			if (cookie && response.config.url)
  // 	// 					this.jar.setCookie(cookie, response.config.url, function(err:any,
  // cookie:any){});
  // 	// 		});
  // 	// 	}
  // 	// 	return response;
  // 	// });
  // }

  // extend(options: requestP.Options): any {
  // 	return Object.assign({}, DEFAULTS, options)
  // }

  // http(options: requestP.Options) {
  // 	options.method = options.method ? options.method.toUpperCase() : GET
  // 	const oopts = this.extend(options)
  // 	return requestP(oopts)
  // }

  get(uri: string, qs?: any, ctx: IContext = new Context()): Promise<any> {
    // let options: requestP.Options = {
    // 	method : GET,
    // 	uri    : uri,
    // 	qs     : qs,
    // }

    // const headers = this.headers(ctx)
    // if (headers) options.headers = headers

    // return this.http(options)

    const headers = this.headers(ctx);
    return axios
      .get(uri, { params: qs, headers: headers, withCredentials: true })
      .then(resp => {
        return ctx.meta.full_response ? resp : resp.data;
      })
      .catch(err => {
        return err.response;
      });
  }

  post(uri: string, data?: any, ctx: IContext = new Context()) {
    // let options: requestP.Options = {
    // 	method : POST,
    // 	uri    : uri,
    // 	body   : data,
    // }

    // const headers = this.headers(ctx)
    // if (headers) options.headers = headers

    // return this.http(options)
    const headers = this.headers(ctx);
    return axios
      .post(uri, data, { headers: headers })
      .then(resp => {
        return ctx.meta.full_response ? resp : resp.data;
      })
      .catch(err => err.response);
  }

  put(uri: string, data?: any, ctx: IContext = new Context()) {
    // let options: requestP.Options = {
    // 	method : PUT,
    // 	uri    : uri,
    // 	body   : data,
    // }

    // const headers = this.headers(ctx)
    // if (headers) options.headers = headers

    // return this.http(options)
    const headers = this.headers(ctx);
    return axios
      .put(uri, data, { headers: headers })
      .then(resp => {
        return ctx.meta.full_response ? resp : resp.data;
      })
      .catch(err => err.response);
  }

  del(uri: string, ctx: IContext = new Context()) {
    // let options: requestP.Options = {
    // 	method : DELETE,
    // 	uri    : uri
    // }

    // const headers = this.headers(ctx)
    // if (headers) options.headers = headers

    // return this.http(options)
    const headers = this.headers(ctx);
    return axios
      .delete(uri, { headers: headers })
      .then(resp => {
        return ctx.meta.full_response ? resp : resp.data;
      })
      .catch(err => err.response);
  }

  headers(ctx: IContext = new Context()): any {
    if (!ctx) return undefined;
    const headers: any = {};

    if (ctx.accessToken) headers[HEADERS.X_ACCESS_TOKEN] = ctx.accessToken;
    if (ctx.traceId) headers[HEADERS.X_TRACE_ID] = ctx.traceId;
    if (ctx.tenantId) headers[HEADERS.X_TENANT_ID] = ctx.tenantId;

    return headers;
  }

  url(base: string, path: string, ...rest: any[]) {
    path = path.startsWith('/') ? path.substr(1) : path;
    const url: string = path.startsWith('http') ? path : [base, path].join('/');
    const parts: string | undefined =
      rest && rest.length > 0
        ? rest
            .map(p => {
              return p.toString();
            })
            .join('/')
        : undefined;
    return parts ? [url, parts].join('/') : url;
  }
}

export const Http = new HTTP();
