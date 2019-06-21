import * as e from 'express'

export type Fn = (arg?:any)=>any

export type ErrHandler = (err:any, req:e.Request, res:e.Response, next?:e.NextFunction)=>any
export type ReqHandler = (req:e.Request, res:e.Response, next?:e.NextFunction)=>any