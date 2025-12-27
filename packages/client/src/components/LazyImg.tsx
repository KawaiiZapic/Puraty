import type { FunctionalComponent } from "preact";

const io = new IntersectionObserver(
	e => {
		e.forEach(v => {
			if (!v.isIntersecting) return;
			const img = v.target;
			const src = img.getAttribute("data-lazy-src");
			if (src) {
				img.setAttribute("src", src);
				img.removeAttribute("data-lazy-src");
			}
			io.unobserve(img);
		});
	},
	{
		threshold: 0
	}
);

export const LazyImg: FunctionalComponent<
	Partial<HTMLImageElement> & { class?: string }
> = attr => {
	const newAttr: Record<string, unknown> = {};
	for (const key in attr) {
		if (key !== "src") {
			// @ts-expect-error complex merging
			newAttr[key] = attr[key];
		} else if (attr.src) {
			newAttr["data-lazy-src"] = attr.src;
		}
	}
	newAttr.ref = (el: HTMLImageElement) => {
		if (!el) return;
		io.observe(el);
		return () => io.unobserve(el);
	};
	return h("img", newAttr, null);
};
