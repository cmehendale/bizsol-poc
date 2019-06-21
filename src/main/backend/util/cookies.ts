import * as Cookie from 'cookie';
import { Request, Response } from 'express';

import { HEADERS } from './constants';
import { Util } from './util';

const MILLISECONDS_MONTH = 1000 * 60 * 60 * 24 * 30;

export interface IRequest {
  get(name: string): string;
}

export interface IResponse {
  get(name: string): string;
  cookie(name: string, value: string, opts: object | any): any;
}

export class Cookies {
  static copyCookie(
    src: IResponse,
    tgt: IResponse,
    name: string,
    cookieOpts: object = {}
  ) {
    const cookie: object | any = this.findCookie(
      src.get(HEADERS.SET_COOKIE),
      name
    );
    if (cookie) tgt.cookie(name, cookie[name], cookieOpts);
  }

  static findCookie(
    cookieStr: string | string[] | number | undefined,
    name: string
  ): object | undefined {
    var Cookies = this.parseCookieStr(cookieStr);
    return Cookies.find((cc: any): boolean => {
      return cc[name] != null && cc[name] != undefined;
    });
  }

  static parseCookieStr(
    cookieStr: string | string[] | number | undefined
  ): object[] {
    if (!cookieStr) return [];
    // console.log("Cookiestr = ", cookieStr)
    if (typeof cookieStr === 'string') return [Cookie.parse(cookieStr)];
    return Util.flatten(
      (cookieStr as any[]).map(this.parseCookieStr.bind(this))
    );
  }

  static cookieDomain(req: IRequest) {
    const host: string | undefined = req.get(HEADERS.HOST) || '';
    var idx = host.indexOf(':');

    return idx < 0 ? host : host.slice(0, idx);
  }

  static cookieOpts(req: IRequest) {
    return {
      domain: this.cookieDomain(req),
      maxAge: MILLISECONDS_MONTH,
      path: '/'
    };
  }
}
