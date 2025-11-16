import type { ReadOnlyRef } from "@puraty/reactivity";
import type {
    EventAttributes,
    StyleAttributes,
    HTMLAttributes,
    HTMLElementAttributes,
    SVGElementAttributes,
    ClassEntry as _ClassEntry,
    ClassRecord
} from "tsx-dom-types";

type RefAttr<T> = {
  [K in keyof T]?: K extends "class" ? unknown : ReadOnlyRef<Extract<T[K], string | boolean | undefined>> | T[K];
};

export type ComponentChild = ComponentChild[] | JSX.Element | string | number | boolean | undefined | null | ReadOnlyRef<JSX.Element | string | number | boolean | undefined | null>;
export type ComponentChildren = ComponentChild | ComponentChild[];
export interface BaseProps {
    children?: ComponentChildren;
}
export type FC<T = BaseProps> = (props: T) => JSX.Element;
export type ComponentAttributes = {
    [s: string]: string | number | boolean | undefined | null | StyleAttributes | EventListenerOrEventListenerObject;
};

export interface HTMLComponentProps<T extends Element> extends BaseProps {
    dangerouslySetInnerHTML?: string;
    /**
     * This is essentially a reverse "is" attribute.
     * If you specify it, the generated tag will be tsxTag and it will receive an "is" attribute with the tag you specified in your JSX.
     * This is needed because we can't make the is-property associate with the correct component props.
     */
    tsxTag?: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
    ref?: RefType<T>;
    ["p-show"]?: ReadOnlyRef<boolean>;
}

export type CustomElementProps<TBase, TName extends keyof HTMLElementTagNameMap | null> = TBase &
    (TName extends keyof HTMLElementTagNameMap
        ? JSX.IntrinsicElements[TName]
        : Omit<HTMLAttributes, "class"> & HTMLComponentProps<Element> & { 'class'?: ClassType });

export type SVGAndHTMLElementKeys = keyof SVGElementTagNameMap & keyof HTMLElementTagNameMap;
export type SVGOnlyElementKeys = Exclude<keyof SVGElementTagNameMap, SVGAndHTMLElementKeys>;
export type IntrinsicElementsHTML = {
    [TKey in keyof HTMLElementTagNameMap]?: RefAttr<HTMLElementAttributes<TKey>> &
        HTMLComponentProps<HTMLElementTagNameMap[TKey]> &
        EventAttributes<HTMLElementTagNameMap[TKey]> &
        { 'class'?: ClassType };
};
export type IntrinsicElementsSVG = {
    [TKey in SVGOnlyElementKeys]?: RefAttr<SVGElementAttributes<TKey>> &
        HTMLComponentProps<SVGElementTagNameMap[TKey]> &
        EventAttributes<SVGElementTagNameMap[TKey]> & 
        { 'class'?: ClassType };
};


export type IntrinsicElementsHTMLAndSVG = IntrinsicElementsHTML & IntrinsicElementsSVG;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomElementsHTML {}

export type RefType<T> = { current: T | null };

export type ClassEntry = _ClassEntry | ReadOnlyRef<string | undefined | null> | Record<string, ClassRecord[string] | ReadOnlyRef<ClassRecord[string]>>;
export type ClassType = ClassEntry | ClassEntry[];