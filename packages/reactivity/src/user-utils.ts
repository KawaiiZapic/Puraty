import { computed, type Ref } from ".";

export const not = (v: Ref<boolean>) => {
	return computed(() => !v.value);
};
