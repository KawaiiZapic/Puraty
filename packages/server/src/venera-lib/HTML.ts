import * as cheerio from "cheerio/slim";
import type { AnyNode } from "domhandler";
import { isTag } from "domhandler";

export class HtmlDocument {
	private $: cheerio.CheerioAPI;
	constructor(html: string) {
		this.$ = cheerio.load(html);
		this.$("table").each((i, el) => {
			const e = this.$(el);
			const firstChild = el.firstChild;
			if (!firstChild || firstChild.nodeType !== 1) return;
			if (firstChild.name !== "tbody") {
				const tbody = this.$("<tbody></tbody>");
				e.children().each((i, child) => {
					tbody.append(child);
				});
				e.children().remove();
				e.prepend(tbody);
			}
		});
	}

	querySelector(query: string): HtmlElement | null {
		const el = this.$(query).first();
		if (el.length === 0) return null;
		return new HtmlElement(el, this.$);
	}

	querySelectorAll(query: string): HtmlElement[] {
		return this.$(query)
			.toArray()
			.map(el => {
				return new HtmlElement(this.$(el), this.$);
			});
	}

	dispose() {
		// do nothing
	}

	getElementById(id: string) {
		return this.querySelector("#" + id);
	}

	get html() {
		return this.$.html();
	}
}

export class HtmlElement {
	private $: cheerio.CheerioAPI;
	private $el: cheerio.Cheerio<AnyNode>;

	constructor(inst: cheerio.Cheerio<AnyNode>, root: cheerio.CheerioAPI) {
		this.$ = root;
		this.$el = inst;
	}

	get text(): string {
		return this.$el.text();
	}

	get attributes(): Record<string, string> {
		return this.$el.attr() ?? {};
	}

	querySelector(query: string): HtmlElement | null {
		const el = this.$el.find(query).first();
		if (el.length === 0) return null;
		return new HtmlElement(el, this.$);
	}

	querySelectorAll(query: string): HtmlElement[] {
		return this.$el
			.find(query)
			.toArray()
			.map(el => new HtmlElement(this.$(el), this.$));
	}

	get children(): HtmlElement[] {
		return this.$el
			.children()
			.map((i, e) => {
				return new HtmlElement(this.$(e), this.$);
			})
			.toArray();
	}

	get nodes(): HtmlNode[] {
		return this.$el
			.contents()
			.filter((i, e) => {
				return e.parent === this.$el[0];
			})
			.map((i, e) => {
				return new HtmlNode(this.$(e), this.$);
			})
			.toArray();
	}

	get innerHTML(): string | null {
		return this.$el.html();
	}

	get parent(): HtmlElement {
		return new HtmlElement(this.$el.parent(), this.$);
	}

	get classNames(): string[] {
		return this.$el.attr("class")?.split(" ") ?? [];
	}
	get id(): string | null {
		return this.$el.attr("id") ?? null;
	}

	get localName() {
		if (!isTag(this.$el[0])) throw new Error("Not a tag element");
		return this.$el[0].name;
	}

	get previousElementSibling(): HtmlElement | null {
		const el = this.$el.prev();
		if (el.length === 0) return null;
		return new HtmlElement(el, this.$);
	}

	get nextElementSibling(): HtmlElement | null {
		const el = this.$el.next();
		if (el.length === 0) return null;
		return new HtmlElement(el, this.$);
	}
}

export class HtmlNode {
	private $el: cheerio.Cheerio<AnyNode>;
	private $: cheerio.CheerioAPI;

	constructor(inst: cheerio.Cheerio<AnyNode>, root: cheerio.CheerioAPI) {
		this.$el = inst;
		this.$ = root;
	}

	get text() {
		return this.$el.text();
	}

	get type() {
		return this.$el[0].type as string;
	}

	toElement(): HtmlElement | null {
		// toElement in Venera is broken, it returns null even for element
		// keep it broken for compatibility
		return null;
		if (this.type !== "tag") return null;
		return new HtmlElement(this.$el, this.$);
	}
}
