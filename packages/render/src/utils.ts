import { isRef, watch, type Ref } from "@puraty/reactivity";
import { ComponentAttributes, ComponentChild } from "./types";

function applyChild(element: JSX.Element, child: ComponentChild | Ref<ComponentChild>) {
    if (isRef(child)) {
        let el: Node | null = null;
        const handler = () => {
            const value = child.value;
            if (value instanceof Node) {
                el?.parentNode?.removeChild(el);
                el = value;
                element.appendChild(el);
            } else if (typeof value === "string" || typeof value === "number") {
                if (el instanceof Text) {
                    el.textContent = value.toString();
                } else {
                    el?.parentNode?.removeChild(el);
                    el = document.createTextNode(value.toString());
                    element.appendChild(el);
                }
            } else {
                console.warn("Unknown type to append: ", value);
                el?.parentNode?.removeChild(el);
                el = null;
            }
        };
        watch(child, handler);
        handler();
        return;
    }
    if (child instanceof Node) 
        element.appendChild(child);
    else if (typeof child === "string" || typeof child === "number")
        element.appendChild(document.createTextNode(child.toString()));
    else console.warn("Unknown type to append: ", child);
}

export function applyChildren(element: JSX.Element, children: ComponentChild[]) {
    for (const child of children) {
        if (!child && child !== 0) continue;

        if (Array.isArray(child)) applyChildren(element, child);
        else applyChild(element, child);
    }
}

export function createDomElement(tag: string, attrs: ComponentAttributes | null) {
    const options = attrs?.is ? { is: attrs.is as string } : undefined;

    if (attrs?.xmlns) return document.createElementNS(attrs.xmlns as string, tag, options) as SVGElement;

    return document.createElement(tag, options);
}

export function applyTsxTag<T extends null | ComponentAttributes>(tag: string, attrs: T) {
    let finalTag = tag;
    let finalAttrs = attrs;
    if (finalAttrs && "tsxTag" in finalAttrs) {
        finalTag = finalAttrs.tsxTag as string;
        if (!finalAttrs.is && tag.includes("-")) {
            finalAttrs = { ...finalAttrs, is: tag };
        }
    }
    return { finalTag, finalAttrs };
}
