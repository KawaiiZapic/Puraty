import { onUpdateSymbol, type Ref, type RefLike } from ".";

export const isRefLike = (v: unknown): v is RefLike => {
	return (
		typeof v === "object" && typeof (v as never)[onUpdateSymbol] === "function"
	);
};

export const isRef = (v: unknown): v is Ref<unknown> => {
	return isRefLike(v) && "value" in (v as never);
};
