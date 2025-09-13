export const delayed = <T extends () => void>(fn: T): T => {
  let im: number | null = null;
  return ((...args) => {
    im = setTimeout(() => {
      im != null && clearTimeout(im);
      fn.apply(null, args);
    });
  }) as T
}