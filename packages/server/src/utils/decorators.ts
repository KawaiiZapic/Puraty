import type { H3 } from "h3";

const s = Symbol();

const controllers: {
  method: "get" | "post" | "delete";
  proto: any;
  value: any;
  path: string;
}[] = [];

export const Controller = (path?: string): ClassDecorator => {
  return (target) => {
    target.prototype[s] = path ?? "";
  };
}

export const Handle = (method: "get" | "post" | "delete", path: string): MethodDecorator => {
  return (target, prop, descriptor) => {
    controllers.push({
      method,
      path,
      proto: target,
      value: descriptor.value
    });
  }
}

export const Get = (path: string): MethodDecorator => {
  return Handle("get", path);
}

export const Post = (path: string): MethodDecorator => {
  return Handle("post", path);
}

export const Delete = (path: string): MethodDecorator => {
  return Handle("delete", path);
}

export const initializeHandlers = (app: H3) => {
  controllers.forEach((info) => {
    app[info.method]("/api" + info.proto[s] + info.path, info.value);
  });
}