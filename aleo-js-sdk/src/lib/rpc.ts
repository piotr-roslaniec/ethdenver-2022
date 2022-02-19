import fetch from 'cross-fetch';
import { Base64 } from 'js-base64';

export class RPC {
  uri: string;
  defaultOptions: RequestInit;
  user: string | undefined;
  password: string | undefined;

  constructor(
    uri: string,
    defaultOptions: RequestInit = {},
    user?: string,
    password?: string
  ) {
    this.uri = uri;
    this.defaultOptions = defaultOptions;
    this.user = user;
    this.password = password;
    return this;
  }

  static create(uri: string): RPC {
    return new RPC(uri);
  }

  async call(methodName: string, ...params: any[]): Promise<any> {
    const id = Math.round(Math.random() * 10000000);

    if (this.user && this.password) {
      this.defaultOptions.headers = {
        Authorization:
          'Basic ' + Base64.encode(this.user + ':' + this.password),
      };
    }
    const response = await fetch(
      this.uri,
      this.mergeOptions(
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Keep-Alive': 'timeout=15, max=100',
            'Connection': 'Keep-Alive'
          },
          keepalive: true,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: id,
            method: methodName,
            params: params,
          }),
        },
        this.defaultOptions
      )
    );
    const data = await response.json();

    if (data.id && data.id !== id) {
      throw new Error('JSONRPCError: response ID does not match request ID!');
    }

    if (data.error) {
      throw new Error(
        `JSONRPCError: server error ${JSON.stringify(data.error)}`
      );
    }
    return data.result;
  }

  private mergeOptions(
    overrideOptions: RequestInit,
    defaultOptions: RequestInit
  ) {
    defaultOptions = defaultOptions || {};
    const headers = Object.assign(
      {},
      defaultOptions.headers || {},
      overrideOptions.headers || {}
    );
    return Object.assign({}, defaultOptions, overrideOptions, {
      headers: headers,
    });
  }
}
