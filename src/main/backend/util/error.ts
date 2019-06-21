export abstract class BaseError extends Error {
  status: number;
  constructor(message?: string) {
    super();
    this.status = 500;
    this.message = message || 'Unknown Error';
  }
}

export class GenericError extends BaseError {
  constructor(message?: string) {
    super(message);
    this.status = 500;
  }
}

export class NotFoundError extends BaseError {
  constructor(name?: string, message?: string) {
    super(message || 'Not Found -- ' + name);
    this.status = 404;
  }
}

export class ServiceNotFoundError extends NotFoundError {
  constructor(name?: string, message?: string) {
    super(name, message || 'Service Not Found -- ' + name);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message?: string) {
    super(message || 'Not logged-in or Insufficient Authorization');
    this.status = 401;
  }
}

export class AuthorizationError extends BaseError {
  constructor(message?: string) {
    super(message || 'Not logged-in or Insufficient Authorization');
    this.status = 403;
  }
}

export class UninitializedError extends BaseError {
  constructor(message?: string) {
    super(message || 'Component not initialized - call the init() method');
    this.status = 500;
  }
}

export class DatabaseError extends Error {}
