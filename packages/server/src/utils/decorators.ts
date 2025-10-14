/* eslint-disable @typescript-eslint/no-explicit-any */
import { getQuery, HTTPError, type H3 } from "h3";

const s = Symbol();

type ParamInfo = (
	| {
			type: "path" | "query";
			id: string;
	  }
	| {
			type: "json" | "event";
	  }
) & { required?: boolean };

const controllers: Map<
	unknown,
	{
		method: "get" | "post" | "delete" | "patch";
		proto: any;
		value: any;
		path: string;
		params: ParamInfo[];
	}
> = new Map();

const instances: Map<unknown, unknown> = new Map();

const initControllerInfo = (func: unknown) => {
	let o = controllers.get(func);
	if (!o) {
		o = {
			method: "get",
			path: "",
			proto: {},
			value: func,
			params: []
		};
		controllers.set(func, o);
	}
	return o;
};

const setParamInfo = (
	func: unknown,
	idx: number,
	info: ParamInfo | { required: boolean }
) => {
	const { params } = initControllerInfo(func);
	if (!params[idx]) {
		params[idx] = {
			...(info as any)
		};
	}
	return params[idx];
};

export const Controller = (path?: string): ClassDecorator => {
	return target => {
		target.prototype[s] = path ?? "";
		instances.set(target.prototype, new (target as any)());
	};
};

export const Handle = (
	method: "get" | "post" | "delete" | "patch",
	path: string
): MethodDecorator => {
	return (target, prop, descriptor) => {
		const o = initControllerInfo(descriptor.value);
		if (!o) {
			controllers.set(descriptor.value, {
				method,
				path,
				proto: target,
				value: descriptor.value,
				params: []
			});
		} else {
			o.method = method;
			o.path = path;
			o.proto = target;
			o.value = descriptor.value;
		}
	};
};

export const Get = (path: string): MethodDecorator => {
	return Handle("get", path);
};

export const Post = (path: string): MethodDecorator => {
	return Handle("post", path);
};
export const Patch = (path: string): MethodDecorator => {
	return Handle("patch", path);
};

export const Delete = (path: string): MethodDecorator => {
	return Handle("delete", path);
};

export const Path = (id: string) => {
	return ((target, prop, idx) => {
		const func = (target as any)[prop!];
		setParamInfo(func, idx, {
			type: "path",
			id
		});
	}) as ParameterDecorator;
};

export const Query = (id: string) => {
	return ((target, prop, idx) => {
		const func = (target as any)[prop!];
		setParamInfo(func, idx, {
			id,
			type: "query"
		});
	}) as ParameterDecorator;
};

export const Json: ParameterDecorator = (target, prop, idx) => {
	const func = (target as any)[prop!];
	setParamInfo(func, idx, {
		type: "json"
	});
};

export const ReqEvent: ParameterDecorator = (target, prop, idx) => {
	const func = (target as any)[prop!];
	setParamInfo(func, idx, {
		type: "event"
	});
};

export const Required: ParameterDecorator = (target, prop, idx) => {
	const func = (target as any)[prop!];
	setParamInfo(func, idx, {
		required: true
	});
};

export const initializeHandlers = (app: H3) => {
	controllers.forEach(info => {
		app.on(info.method, "/api" + info.proto[s] + info.path, async e => {
			const args: unknown[] = await Promise.all(
				info.params.map(async v => {
					if (v.type === "event") {
						return e;
					} else if (v.type === "json") {
						try {
							return await e.req.json();
						} catch {
							if (v.required) {
								throw HTTPError.status(400, undefined, {
									message: "Required parameter JSON@body not existed"
								});
							}
						}
					} else if (v.type === "path") {
						const r = e.context.params?.[v.id];
						if (v.required && typeof r === "undefined") {
							throw HTTPError.status(400, undefined, {
								message: "Required parameter " + v.id + "@path not existed"
							});
						}
						return r;
					} else if (v.type === "query") {
						const r = getQuery(e)[v.id];
						if (v.required && typeof r === "undefined") {
							throw HTTPError.status(400, undefined, {
								message: "Required parameter " + v.id + "@query not existed"
							});
						}
						return r;
					}
				})
			);
			return info.value.apply(instances.get(info.proto), args);
		});
	});
};
