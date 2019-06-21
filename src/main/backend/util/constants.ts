export namespace DB {
  export const TENANT_ID = 'tenant_id';
}

export namespace SERVICE {
  export const AUTH = 'AUTH';
  export const PRE = 'PRE';
  export const POST = 'POST';
  export const EXEC = 'EXEC';
  export const SANITIZE = 'SANITIZE';
  export const RENDER = 'RENDER';
  export const ERROR = 'ERROR';

  export const STATE_EVENT = 'STATE.EVENT';
  export enum STATE {
    NONE,
    CREATED,
    STARTING,
    RUNNING,
    STOPPING,
    STOPPED
  }
}

export namespace HEADERS {
  export const X_ACCESS_TOKEN: string = 'x-access-token';
  export const X_TRACE_ID: string = 'x-trace-id';
  export const X_TENANT_ID: string = 'x-tenant-id';
  export const SET_COOKIE: string = 'set-cookie';
  export const HOST: string = 'host';
}

export namespace PROVIDERS {
  export const ANON: string  = "anon"
  export const LOCAL: string = "local"
}