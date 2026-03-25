import { c } from "tjs:readline";

export const createLogger = (_tag: string) => {
	const normalizeMsg = (msg: unknown[]) => {
		return msg
			.map(v => {
				if (v instanceof Error) {
					return "\n" + v.name + ": " + v.message + "\n" + c.dim(v.stack || "");
				}
				return String(v);
			})
			.join(" ");
	};
	const getTime = () => {
		return c.dim(new Date().toLocaleTimeString());
	};
	const tag = c.blue(`[${_tag}]`);
	return {
		info: (...msg: unknown[]) => {
			console.log(`${getTime()} ${tag} ${normalizeMsg(msg)}`);
		},
		error: (...msg: unknown[]) => {
			console.log(`${getTime()} ${tag} ${c.red(normalizeMsg(msg))}`);
		},
		warn: (...msg: unknown[]) => {
			console.log(`${getTime()} ${tag} ${c.yellow(normalizeMsg(msg))}`);
		}
	};
};
