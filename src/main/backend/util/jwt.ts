import * as jwtoken from 'jsonwebtoken';
//// import * as Promise from 'bluebird'

export class JWT {
  encode(payload: any, secret: string): Promise<string> {
    return Promise.resolve(jwtoken.sign(payload, secret));
  }

  decode(token: string, secret: string): Promise<any> {
    return Promise.resolve(jwtoken.verify(token, secret));
  }

  testfn() {
    console.log('REST');
  }
}

export const jwt = new JWT();
