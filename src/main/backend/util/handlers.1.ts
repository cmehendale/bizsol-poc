import * as E from 'express';
import {Util} from './util'
import {Timer} from './timer'

const jsdom = require('jsdom-global')
var stringify = require("json-stringify-pretty-compact")

import * as path from 'path'

export function NOOP(req:E.Request, res:E.Response):any {
    return (res as any).result
}

export function ERROR(err:any, req:E.Request, res:E.Response):any {	
    console.log("==========================================")
    console.log("ERR", err)
    console.log("==========================================")
    console.log("REQ", req)
    console.log("==========================================")
    console.log("RES", res)
    console.log("==========================================")
    
    return res.format({
      json: ()=> {
          console.log(err)
          res.status(err.status || 500).send(err)
          return
      },
      html: ()=> {
        res.render("error", err);
      }
    });
  }
  
export function AUTH_ERROR(err:any, req:E.Request, res:E.Response):any {
      return res.format({
          html: () => {
                  res.redirect(Util.url(req.baseUrl, `/login?r=${req.path}`))
          },
          json: () => {
              return res.status(err.status || 500).send(err);
          }
      });
  }
  
export function RENDER(cfg:any) {
    return (req:E.Request, res:E.Response):any => {
      const result = (res as any).result;
      return res.format({
          json: ()=> {
                res.send(result || {})
              return
          },
          html: ()=> {
              result.opts = JSON.stringify( {
                  user: (req as any).user || {},
                  riot: result.riot || {},
              })
              result.meta = result.meta || [];
              const t = Timer.start('SSR_APP')
              try {
                  result.app  = SSR_APP(cfg.tagDirs, result.riot)
                  console.log("RENDERED", result.app)
              } catch(a) {
                  console.log("ERROR", a) 
              } finally {                  
                  console.log(stringify(t.stop().result(), {maxLength:400}))
              }
              res.render(result.view || "riot", result);		
          }
      });
    }
  }

function setupRiot() {
    // ADD NODE_PATH for riot to be resolved correctly

    let arr = require.resolve('riot').split('/')
    let idx = arr.indexOf('node_modules')
    arr = arr.slice(0, idx+1)

//    update NODE PATH with the value of riot's parent node_modules folder
    process.env.NODE_PATH = `${(process.env.NODE_PATH || '')}:${arr.join('/')}`
    const riot = require('riot');

    (global as any).riot = riot;
    (window as any).riot = riot;

    return riot
}

export function SSR_APP(tagDirs:string[], opts:any):string {

    const requireTag = (tagDirs:string[], tagName:string):any => {
        console.log("tagDirs", tagDirs)
        for (let ii = 0; ii < tagDirs.length; ii++) {
            try {
                console.log("Finding", `${tagDirs[ii]}/${tagName}.tag`)
                const tt =  require(`${tagDirs[ii]}/${tagName}.tag`)
                console.log("Found Tag", tt)
                return tt
            } catch (a) {
                console.log("Not found", `${tagDirs[ii]}/${tagName}.tag`)
            }
        }

        throw new Error(`Cannot find any tag for ${tagName}`);
    }

    const cleanup = jsdom()
    const riot = require('riot')  
    const tag  = requireTag(tagDirs, opts.view) //require(`shared/tags/${opts.view}.tag`)
    console.log("Rendering", tag)
    try {
        const html = riot.render(tag, opts.params || {});
    (global as any).riot = undefined;
    (window as any).riot = undefined;

    (global as any).rg = undefined;
    (window as any).rq = undefined;

    cleanup()
    console.log("Returning HTML", html)
    return html
    } catch (a) {
        console.log("Error in Rendering", a)
        //throw a
        return "ERROR MAN"
    }
}

export function FINISH(req:E.Request, res:E.Response):any {}