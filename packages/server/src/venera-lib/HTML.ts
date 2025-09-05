// to be implemented with htmlparser2

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export class HtmlDocument {
    inst: cheerio.CheerioAPI;
    constructor(html: string) {
        this.inst = cheerio.load(html);
    }

    querySelector(query: string): HtmlElement {
        return new HtmlElement(cheerio.load(this.inst(query)[0]).root());
    }

    querySelectorAll(query: string): HtmlElement[] {
        return Array.from(this.inst(query)).map(v => new HtmlElement(cheerio.load(v).root()));
    }

    dispose() {
        // do nothing
    }

    getElementById(id: string) {
        return this.querySelector("#" + id);
    }
}

export class HtmlElement {
    inst: cheerio.Cheerio<AnyNode>;

    constructor(inst: cheerio.Cheerio<AnyNode>) {
        this.inst = inst;
    }

    get text(): string {
        return this.inst.text();
    }

    get attributes(): Record<string, string> {
        return this.inst.attr() ?? {};
    }

    querySelector(query: string): HtmlElement {
        return new HtmlElement(cheerio.load(this.inst.children(query)[0]).root());
    }

    querySelectorAll(query: string): HtmlElement[] {
        return Array.from(this.inst.children(query)).map(v => new HtmlElement(cheerio.load(v).root()));
    }

    get children(): HtmlElement[] {
        return Array.from(this.inst.children()).map(v => new HtmlElement(cheerio.load(v).root()));
    }

    get nodes(): HtmlElement[] {
        return Array.from(this.inst.children()).map(v => new HtmlElement(cheerio.load(v).root()));
    }

    get innerHTML(): string | null {
        return this.inst.html();
    }

    get parent(): HtmlElement {
        return new HtmlElement(this.inst.parent());
    }

    get classNames(): string[] {
        return this.inst.attr("class")?.split(" ") ?? [];
    }
    get id(): string | null {
        return this.inst.attr("id") ?? null;
    }

    get localName() {
        return "";
    }

    get previousElementSibling(): HtmlElement | null {
        return new HtmlElement(this.inst.prev());
    }

    get nextElementSibling(): HtmlElement | null {
        return new HtmlElement(this.inst.next());
    }
}

export class HtmlNode {
    inst: cheerio.Cheerio<AnyNode>;

    constructor(inst: cheerio.Cheerio<AnyNode>) {
        this.inst = inst;
    }

    get text() {
        return this.inst.text();
    }

    get type() {
        return this.inst[0].type as string;
    }

    toElement(): HtmlElement | null {
        return new HtmlElement(this.inst);
    }
}