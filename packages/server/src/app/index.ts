import { H3, HTTPError } from "h3";
import { serve } from "h3-txikijs-adapter";
import path from "tjs:path";

import "./comic-source/comic-source.controller";
import "./comic/comic.controller";
import "./commands/commands.controller";
import "./misc/misc.controller";
import { initializeHandlers } from "@/utils/decorators";
import { requestExitFullscreen } from "@/utils/process";

const assertBase = "./frontend";
const serveStatic = async (fp: string) => {
	const p = path.join(assertBase, fp);
	try {
		const f = await tjs.open(p, "r");
		return {
			size: (await f.stat()).size.toString(),
			body: f.readable
		};
	} catch {
		throw new HTTPError("File not found", {
			status: 404
		});
	}
};

export class App {
	app: H3;
	constructor() {
		this.app = new H3();

		this.app.get("/", async e => {
			requestExitFullscreen();
			e.res.headers.set("content-type", "text/html");
			const { body, size } = await serveStatic("index.html");
			e.res.headers.set("content-length", size);
			return body;
		});

		this.app.get("/assets/**", async e => {
			const f = e.context.params!._;
			if (f.endsWith(".css")) {
				e.res.headers.set("content-type", "text/css");
			} else if (f.endsWith(".js")) {
				e.res.headers.set("content-type", "text/javascript");
			}

			const { body, size } = await serveStatic(
				"/assets/" + e.context.params!._
			);
			e.res.headers.set("content-length", size);
			return body;
		});

		initializeHandlers(this.app);
	}

	serve(signal: AbortSignal) {
		return serve(this.app, {
			signal
		});
	}
}
