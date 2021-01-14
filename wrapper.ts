import { HTTPOptions, serve, Server, ServerRequest } from "https://deno.land/std/http/server.ts";

function methodHandlerFactory(handlers: any, method: string) {
  return function (path: string, fns: Function[]) {
    handlers[method][path] = fns;
  }
}

function itterateAndExecHandler(req: ServerRequest, handlers: Function[]) {
  const fn = handlers[0];
  if (!fn) { return; }
  fn(req, (err: Error) => {
    if (err) { console.log(err); return; }
    itterateAndExecHandler(req, handlers.slice(1));
  })
}

export class Wrapper {
  handlers: any = {
    get: {},
    post: {},
    put: {},
    delete: {}
  };

  server: Server | undefined;
  #listen = async (s: Server): Promise<void> => {
    this.server = s;
    for await (const req of this.server) {
      const path: string = req.url;
      const method: string = req.method.toLowerCase();
      const requestHandlers = this.handlers[method][path];
      if (requestHandlers) {
        itterateAndExecHandler(req, requestHandlers)
      } else {
        req.respond({ body: `Route ${method} ${path} not found!` });
      }
    }
  };

  listen(sc: HTTPOptions): void {
    this.#listen(serve(sc));
  }

  get(path: string, ...handlers: Function[]): void {
    methodHandlerFactory(this.handlers, 'get')(path, handlers);
  }
  post(path: string, ...handlers: Function[]) {
    methodHandlerFactory(this.handlers, 'post')(path, handlers);
  }
}