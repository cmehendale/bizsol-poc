import * as crypto from 'crypto';
//// import * as Promise from 'bluebird'

const IV_LEN = 16;

export enum ALGOS {
  AES_256_CBC = 'aes-256-cbc'
}

export function randomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function hash(password: string, salt: string): Promise<string> {
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  return Promise.resolve(hash.digest('hex'));
}

export function encrypt(
  algo: ALGOS,
  text: string,
  key: string
): Promise<string> {
  const IV = new Buffer(crypto.randomBytes(IV_LEN));
  const cipher = crypto.createCipheriv(algo, new Buffer(key), IV);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return Promise.resolve(`${IV.toString('hex')}/${crypted}`);
}

export function decrypt(
  algo: ALGOS,
  text: string,
  key: string
): Promise<string> {
  const parts = text.split('/');
  const IV = new Buffer(parts[0], 'hex');
  const crypted = parts[1];
  const decipher = crypto.createDecipheriv(algo, key, IV);
  let dec = decipher.update(crypted, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return Promise.resolve(dec);
}
