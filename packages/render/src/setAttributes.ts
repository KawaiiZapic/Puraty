import { classnames, ClassEntry as NonReactiveClassEntry, type ClassRecord } from "tsx-dom-types";

import { isRef, isRefLike, watch, type ReadOnlyRef } from "@puraty/reactivity";

import { ComponentAttributes, RefType, type ClassEntry, type ClassType } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transferKnownProperties(source: any, target: any) {
    for (const key of Object.keys(source)) {
        if (key in target) target[key] = source[key];
    }
}

/** "on" followed by an uppercase character. Not sure if there are any events with anything other than A-Z. Checking unicode just to be safe */
const eventAttributeName = /^on\p{Lu}/u;

function handleClassAttributes(element: HTMLElement | SVGElement, value: Exclude<ClassType, ReadOnlyRef>) {
    if (Array.isArray(value)) {
        const handleReactiveEntry = (entry: ClassEntry) => {
            if (isRefLike(entry)) {
                watch(entry, () => {
                    setClass();
                });
            } else if (typeof entry === "object" && entry) {
                for (const key in entry) {
                    if (isRef(entry[key])) {
                        watch(entry[key], () => {
                            setClass();
                        });
                    }
                }
            }
        }
        const setClass = () => {
            const finalValue = value.map((entry) => {
                if (isRef(entry)) {
                    return classnames(entry.value);
                } else if (typeof entry === "object" && entry) {
                    const _entry = {} as ClassRecord;
                    for (const key in entry) {
                        if (isRef(entry[key])) {
                            _entry[key] = entry[key].value;
                        } else {
                            _entry[key] = entry[key];
                        }
                    }
                    return classnames(_entry);
                } else {
                    return classnames(entry);
                }
            }).filter(v => typeof v === "string").join(" ");

            if (finalValue) {
                element.setAttribute("class", finalValue);
            } else {
                element.removeAttribute("class");
            }
        }
        value.forEach(entry => {
            handleReactiveEntry(entry);
        });
        setClass();
    } else if (value && typeof value === "object") {
        if (isRef(value)) {
            throw new Error("value should not be a ref");
        }
        const setClass = () => {
            const _value = {} as ClassRecord;
            for (const key in value) {
                if (isRef(value[key])) {
                    _value[key] = value[key].value;
                } else {
                    _value[key] = value[key];
                }
            }
            const final = classnames(_value);
            if (!final) {
                element.removeAttribute("class");
            } else {
                element.setAttribute("class", final);
            }
        }
        for (const key in value) {
            if (isRef(value[key])) {
                watch(value[key], () => setClass());
            }
        }
        setClass();
    } else if (value) {
        element.setAttribute("class", value);
    } else {
        element.removeAttribute("class");
    }
}

function setAttribute(element: HTMLElement | SVGElement, name: string, value: any) {
    if (isRef(value)) {
        watch(value, () => setAttribute(element, name, value.value));
        return void setAttribute(element, name, value.value);
    } else if (isRefLike(value)) {
        watch(value, () => setAttribute(element, name, value));
    }
    // Ignore some debug props that might be added by bundlers
    if (name === "__source" || name === "__self" || name === "tsxTag") return;
    if (name === "class") {
        handleClassAttributes(element, value);
    } else if (name === "ref") {
        (value as RefType<any>).current = element;
    } else if (name === "p-show") {
        element.style.display = value ? "" : "none";
    } else if (eventAttributeName.test(name)) {
        const finalName = name.replace(/Capture$/, "");
        const useCapture = name !== finalName;
        const eventName = finalName.toLowerCase().substring(2);
        element.addEventListener(eventName, value as EventListenerOrEventListenerObject, useCapture);
    } else if (name === "style" && typeof value !== "string") {
        // Special handler for style with a value of type CSSStyleDeclaration
        transferKnownProperties(value, element.style);
    } else if (name === "dangerouslySetInnerHTML") element.innerHTML = value as string;
    else if (value === true) element.setAttribute(name, name);
    else if (value || value === 0 || value === "") element.setAttribute(name, value.toString());
    else element.removeAttribute(name);
}

export function setAttributes(element: JSX.Element, attrs: ComponentAttributes) {
    for (const name of Object.keys(attrs)) {
        if (!(element instanceof HTMLElement || element instanceof SVGElement)) continue;
        setAttribute(element, name, attrs[name]);
    }
}
