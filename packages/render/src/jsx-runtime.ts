import { setAttributes } from "./setAttributes";
import type { BaseProps, FC } from "./types";
import { applyChildren, createDomElement, applyTsxTag } from "./utils";

export const Fragment = (props: BaseProps): JSX.Element => {
 if (props.children instanceof Node) {
    return props.children;
  } else if (typeof props.children === "string" || typeof props.children === "number") {
    return document.createTextNode(props.children.toString());
  } else {
    return jsx("div", props);
  }
};

export function jsx(tag: string | FC, props: BaseProps): JSX.Element {
    if (typeof tag === "function") return tag(props);

    const { children, ...attrs } = props;
    const { finalTag, finalAttrs } = applyTsxTag(tag, attrs);
    const element = createDomElement(finalTag, finalAttrs);

    setAttributes(element, finalAttrs);

    applyChildren(element, [children]);
    return element;
}

export { jsx as jsxs, jsx as jsxDEV };
