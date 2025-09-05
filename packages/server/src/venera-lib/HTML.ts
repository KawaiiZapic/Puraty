// to be implemented with htmlparser2

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export class HtmlDocument {
    $: cheerio.CheerioAPI;
    constructor(html: string) {
        this.$ = cheerio.load(html);
    }

    querySelector(query: string): HtmlElement | null {
        const el = this.$(query).first();
        if (el.length === 0) return null;
        return new HtmlElement(el, this.$);
    }

    querySelectorAll(query: string): HtmlElement[] {
        return this.$(query).toArray().map((el) => {
            return new HtmlElement(this.$(el), this.$);
        });
    }

    dispose() {
        // do nothing
    }

    getElementById(id: string) {
        return this.querySelector("#" + id);
    }
}

export class HtmlElement {
    $: cheerio.CheerioAPI;
    $el: cheerio.Cheerio<AnyNode>;

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
        const el = this.$el.children(query).first();
        if (el.length === 0) return null;
        return new HtmlElement(el, this.$);
    }

    querySelectorAll(query: string): HtmlElement[] {
        return this.$el.children(query)
            .toArray()
            .map(el => new HtmlElement(this.$(el), this.$));
    }

    get children(): HtmlElement[] {
        return this.$el.children().map((i, e) => {
            return new HtmlElement(this.$(e), this.$);
        }).toArray();
    }

    get nodes(): HtmlNode[] {
        return this.$el.children().map((i, e) => {
            return new HtmlNode(this.$(e), this.$);
        }).toArray();
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
        return this.$el[0].type as string;
    }

    get previousElementSibling(): HtmlElement | null {
        return new HtmlElement(this.$el.prev(), this.$);
    }

    get nextElementSibling(): HtmlElement | null {
        return new HtmlElement(this.$el.next(), this.$);
    }
}

export class HtmlNode {
    $el: cheerio.Cheerio<AnyNode>;
    $: cheerio.CheerioAPI;

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
        return new HtmlElement(this.$el, this.$);
    }
}