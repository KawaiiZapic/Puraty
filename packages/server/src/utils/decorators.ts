/* eslint-disable @typescript-eslint/no-explicit-any */
import { getQuery, HTTPError, type H3 } from "h3";

const s = Symbol();

type ExtraParamInfo = { notRequired?: boolean; convert?: "integer" | "bool" };
type ParamInfo = (
	| {
			type: "path" | "query";
			id: string;
	  }
	| {
			type: "json" | "event";
	  }
) &
	ExtraParamInfo;

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
	info: ParamInfo | ExtraParamInfo
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

export const NotRequired: ParameterDecorator = (target, prop, idx) => {
	const func = (target as any)[prop!];
	setParamInfo(func, idx, {
		notRequired: true
	});
};

export const Integer: ParameterDecorator = (target, prop, idx) => {
	const func = (target as any)[prop!];
	setParamInfo(func, idx, {
		convert: "integer"
	});
};

export const Bool: ParameterDecorator = (target, prop, idx) => {
	const func = (target as any)[prop!];
	setParamInfo(func, idx, {
		convert: "bool"
	});
};

const typeConvert = (v: unknown, convert: ExtraParamInfo["convert"]) => {
	if (typeof v === "undefined") {
		return v;
	}
	if (convert === "integer") {
		if (typeof v === "string") {
			const r = parseInt(v, 10);
			if (isNaN(r) || r.toString() !== v) {
				return undefined;
			}
			return r;
		}
	} else if (convert === "bool") {
		if (typeof v === "string") {
			return v === "true";
		}
	}
	return v;
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
							const r = typeConvert(await e.req.json(), v.convert);
							if (typeof r === "undefined") {
								throw new Error();
							}
							return r;
						} catch {
							if (!v.notRequired) {
								throw HTTPError.status(400, undefined, {
									message: "Required parameter JSON@body not existed"
								});
							}
						}
					} else if (v.type === "path") {
						const r = typeConvert(e.context.params?.[v.id], v.convert);
						if (v.notRequired && typeof r === "undefined") {
							throw HTTPError.status(400, undefined, {
								message: "Required parameter " + v.id + "@path not existed"
							});
						}
						return r;
					} else if (v.type === "query") {
						const r = typeConvert(getQuery(e)[v.id], v.convert);
						if (v.notRequired && typeof r === "undefined") {
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
