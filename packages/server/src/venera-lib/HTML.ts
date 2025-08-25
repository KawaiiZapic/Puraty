// to be implemented with htmlparser2

class HtmlDocument {
    constructor(html: string) {
        throw new Error("Not implemented");
    }

    querySelector(query: string) {
        throw new Error("Not implemented");
    }

    querySelectorAll(query: string) {
        throw new Error("Not implemented");
    }

    dispose() {
        // do nothing
    }

    getElementById(id: string) {
        throw new Error("Not implemented");
    }
}

class HtmlElement {
    constructor() {
        throw new Error("Not implemented");
    }

    get text() {
        throw new Error("Not implemented");
    }

    get attributes() {
        throw new Error("Not implemented");
    }

    querySelector(query: string) {
        throw new Error("Not implemented");
    }

    querySelectorAll(query: string) {
        throw new Error("Not implemented");
    }

    get children() {
        throw new Error("Not implemented");
    }

    get nodes() {
        throw new Error("Not implemented");
    }

    get innerHTML() {
        throw new Error("Not implemented");
    }

    get parent() {
        throw new Error("Not implemented");
    }

    get classNames(): string[] {
        throw new Error("Not implemented");
    }
    get id(): string | null {
        throw new Error("Not implemented");
    }

    get localName() {
        throw new Error("Not implemented");
    }

    get previousElementSibling(): HTMLElement | null {
        throw new Error("Not implemented");
    }

    get nextElementSibling(): HTMLElement | null {
        throw new Error("Not implemented");
    }
}

class HtmlNode {
    constructor(k: number, doc: number) {
        throw new Error("Not implemented");
    }

    get text() {
        throw new Error("Not implemented");
    }

    get type() {
        throw new Error("Not implemented");
    }

    toElement(): HTMLElement | null {
        throw new Error("Not implemented");
    }
}