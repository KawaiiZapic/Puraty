const color = {
	red: (msg: string) => "\x1b[31m" + msg + "\x1b[0m",
	yellow: (msg: string) => "\x1b[33m" + msg + "\x1b[0m",
	green: (msg: string) => "\x1b[32m" + msg + "\x1b[0m",
	gray: (msg: string) => "\x1b[2m\x1b[37m" + msg + "\x1b[0m",
	blue: (msg: string) => "\x1b[34m" + msg + "\x1b[0m",
	white: (msg: string) => "\x1b[37m" + msg + "\x1b[0m"
};

const stdout = tjs.stdout.getWriter();

export const createLogger = (_tag: string) => {
	const normalizeMsg = (msg: unknown) => {
		if (msg instanceof Error) {
			return (
				"\n" +
				msg.name +
				": " +
				msg.message +
				"\n" +
				color.gray(msg.stack || "") +
				"\n"
			);
		}
		return String(msg) + "\n";
	};
	const getTime = () => {
		return color.gray(new Date().toLocaleTimeString());
	};
	const encoder = new TextEncoder();
	const tag = color.blue(`[${_tag}]`);
	return {
		info: (msg: unknown) => {
			stdout.write(encoder.encode(`${getTime()} ${tag} ${normalizeMsg(msg)}`));
		},
		error: (msg: unknown) => {
			stdout.write(
				encoder.encode(`${getTime()} ${tag} ${color.red(normalizeMsg(msg))}`)
			);
		},
		warn: (msg: unknown) => {
			stdout.write(
				encoder.encode(`${getTime()} ${tag} ${color.yellow(normalizeMsg(msg))}`)
			);
		}
	};
};
