import { IContext } from './context';
import { Http } from './http';
import { Registry } from './registry';
import { Util } from './util';

export class Client {
  name: string;
  registry: Registry;

  constructor(name: string) {
    const serviceKey = `depends${name ? '.' + name : ''}`;
    const serviceName = Util.safeConfig(`${serviceKey}.name`, '');
    const serviceGroup = Util.safeConfig(`${serviceKey}.group`, '');
    this.name = `${serviceName}.${serviceGroup}`;
    if (this.name.trim() === '.')
      throw new Error(
        'Service name and/or group of dependency services must be specified'
      );
    this.registry = new Registry().init();
  }

  ready(): Promise<any> {
    return this.registry.findOrWait(this.name);
  }

  destroy() {
    this.registry.destroy();
  }

  create(uri: string, data: any, ctx?: IContext): Promise<any> {
    return this.post(uri, data, ctx);
  }

  post(uri: string, data: any, ctx?: IContext): Promise<any> {
    return this.ready().then(base => {
      const url = Http.url(base, uri);
      return Http.post(url, data, ctx);
    });
  }

  read(uri: string, ctx?: IContext): Promise<any> {
    return this.get(uri, ctx);
  }

  get(uri: string, qs: any, ctx?: IContext): Promise<any> {
    return this.ready().then(base => {
      const url = Http.url(base, uri);
      return Http.get(url, qs, ctx);
    });
  }

  update(uri: string, data: any, ctx?: IContext): Promise<any> {
    return this.put(uri, data, ctx);
  }

  put(uri: string, id: string, data: any, ctx?: IContext): Promise<any> {
    return this.ready().then(base => {
      const url = Http.url(base, uri, id);
      return Http.put(url, data, ctx);
    });
  }

  delete(uri: string, id: string, ctx?: IContext): Promise<any> {
    return this.del(uri, id, ctx);
  }

  del(uri: string, id: string, ctx?: IContext): Promise<any> {
    return this.ready().then(base => {
      const url = Http.url(base, uri, id);
      return Http.del(url, ctx);
    });
  }
}
