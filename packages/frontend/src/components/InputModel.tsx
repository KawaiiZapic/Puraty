import { watch, type Ref } from "@puraty/reactivity";
import { h, type IntrinsicElementsHTML } from "@puraty/render"

export const Input = (props: IntrinsicElementsHTML["input"] & { modelValue?: Ref<string> }) => {
  const $ = h("input", {
    ...props,
    modelValue: undefined,
  } as any) as HTMLInputElement;
  if (props.modelValue) {
    $.addEventListener("input", () => {
      props.modelValue!.value = $.value;
    });
    watch(props.modelValue!, () => {
      $.value = props.modelValue!.value;
    }, { immediate: true })
  }
  return $;
}

export const Checkbox = (props: IntrinsicElementsHTML["input"] & { modelValue?: Ref<boolean | string> }) => {
  const $ = h("input", {
    ...props,
    type: "checkbox",
    modelValue: undefined,
  } as any) as HTMLInputElement;
  if (props.modelValue) {
    $.addEventListener("change", () => {
      if (typeof props.modelValue!.value === "string") {
        props.modelValue!.value = $.checked ? "true" : "false";
      } else {
        props.modelValue!.value = $.checked;
      }
    });
    watch(props.modelValue!, () => {
      $.checked = props.modelValue!.value === true || props.modelValue!.value === "true";
    }, { immediate: true })
  }
  return $;
}

export const Select = (props: IntrinsicElementsHTML["select"] & { modelValue?: Ref<string> }) => {
  const $ = h("select", {
    ...props,
    modelValue: undefined,
  } as any, props.children) as HTMLSelectElement;
  if (props.modelValue) {
    $.addEventListener("change", () => {
      props.modelValue!.value = $.value;
    });
    watch(props.modelValue!, () => {
      $.value = props.modelValue!.value;
    }, { immediate: true })
  }
  return $;
}