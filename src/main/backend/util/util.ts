import * as shortid from 'shortid';
import * as uuid from 'uuid';

const config = require('config');

export class Util {
	
  static url(base: string, uri: string) {
    const regex: RegExp = new RegExp('/+', 'g');
    return [base, uri].join('/').replace(regex, '/');
  }

  static safe(obj: any): any {
    return obj || {};
  }

  static safeConfig<T>(name: string, def: T): T {
    return config.has(name) ? config.get(name) : def;
  }

  static getConfig<T>(name: string, def: T): T {
    return config.has(name) ? config.get(name) : def;
  }

  static uuid4(): string {
    return uuid.v4();
  }

  static shortId(): string {
    return shortid.generate();
  }

  static reduceByGroup(
    results: Array<any>,
    xformKey: Function = (k: any) => k,
    xformVal: Function = (v: any) => v
  ): Promise<Map<any, Array<any>>> {
    const reduction: Map<any, Array<any>> = results.reduce((map, element) => {
      var key = xformKey(element.group);
      var val = xformVal(element.reduction);
      map.set(key, val);

      return map;
    }, new Map<any, Array<any>>());

    return Promise.resolve(reduction as Map<any, Array<any>>);
  }

  static flatten(arr: any[]): any[] {
    if (!arr) return [];
    return arr.reduce((a, b) => {
      return a.concat(Array.isArray(b) ? this.flatten(b) : b);
    }, []);
  }

  static extend(obj1: any, obj2: any): any {
    if (!obj1) return obj2;
    if (!obj2) return obj1;

    let keys: string[] = Object.keys(obj1);
    keys.push(...Object.keys(obj2));

    return keys.reduce(
      (merged: any, key: string, idx: number, keys: string[]): any => {
        let v1: any = obj1[key];
        let v2: any = obj2[key];

        merged[key] = v1;
        if (v2 != undefined) {
          merged[key] =
            typeof v2 === 'object' ? this.extend(obj1[key], v2) : v2;
        }

        return merged;
      },
      {}
    );
  }

  static deepcopy<T>(o: T): T {
    return JSON.parse(JSON.stringify(o));
  }
}
