import { onUpdateSymbol, type Ref } from ".";

export const isRef = (v: unknown): v is Ref  => {
  return typeof v === "object" && onUpdateSymbol in (v as any);
}