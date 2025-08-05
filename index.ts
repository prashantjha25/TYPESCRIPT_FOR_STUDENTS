interface ObserverHandlers<T> {
  next?: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}

class Observer<T> {
  private handlers: ObserverHandlers<T>;
  private isUnsubscribed: boolean = false;
  public _unsubscribe?: () => void;

  constructor(handlers: ObserverHandlers<T>) {
    this.handlers = handlers;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }
      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }
      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable<T> {
  private _subscribe: (observer: Observer<T>) => (() => void) | void;

  constructor(subscribe: (observer: Observer<T>) => (() => void) | void) {
    this._subscribe = subscribe;
  }

  static from<U>(values: U[]): Observable<U> {
    return new Observable<U>((observer) => {
      values.forEach((value) => observer.next(value));
      observer.complete();
      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(handlers: ObserverHandlers<T>): { unsubscribe: () => void } {
    const observer = new Observer<T>(handlers);
    const unsubscribe = this._subscribe(observer);
    if (unsubscribe) {
      observer._unsubscribe = unsubscribe;
    }
    return {
      unsubscribe: () => observer.unsubscribe()
    };
  }
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const userMock = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleated: false,
};

type Request = {
  method: string;
  host: string;
  path: string;
  body?: unknown;
  params: Record<string, unknown>;
};

const requestsMock: Request[] = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request: Request): { status: number } => {
  return { status: HTTP_STATUS_OK };
};

const handleError = (error: unknown): { status: number } => {
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = (): void => console.log('complete');

const requests$ = Observable.from<Request>(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
