/**
 * 
 * Forked from https://github.com/Lusito/tsx-dom
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2018 Santo Pfingsten
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
*/

import { CustomElementsHTML, IntrinsicElementsHTML, IntrinsicElementsSVG } from "./types";

export * from "./createElement";
export * from "./defineCustomElement";
export * from "./jsx-runtime";
export * from "./types";

export interface TsxConfig {
    [s: string]: boolean;
}

// Returns TIF if T is specified as true in TsxConfig, otherwise TELSE
type IfTsxConfig<T extends string, TIF, TELSE> = TsxConfig[T] extends false ? TELSE : TIF;

type IntrinsicElementsCombined = IfTsxConfig<"html", IntrinsicElementsHTML, unknown> &
    IfTsxConfig<"svg", IntrinsicElementsSVG, unknown>;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        // Return type of jsx syntax
        type Element = IfTsxConfig<"html", HTMLElement, never> | IfTsxConfig<"svg", SVGElement, never> | Node;

        // The property name to use
        interface ElementAttributesProperty {
            props: unknown;
        }

        // The children name to use
        interface ElementChildrenAttribute {
            children: unknown;
        }

        // The available string tags
        interface IntrinsicElements extends IntrinsicElementsCombined, CustomElementsHTML {}
    }
}
