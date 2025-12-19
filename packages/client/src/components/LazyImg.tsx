import type { BaseProps } from "@puraty/render";

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

export const LazyImg = (
	attr: Partial<HTMLImageElement> & BaseProps & { class?: string }
) => {
	const img = new Image();
	for (const key in attr) {
		if (key in img || key === "class") {
			if (key === "src") continue;
			if (key === "class") {
				img.className = Array.isArray(attr.class)
					? attr.class.join(" ")
					: attr.class!;
			}
			// @ts-expect-error assign
			img[key] = attr[key];
		}
	}

	img.setAttribute("data-lazy-src", attr.src!);
	io.observe(img);
	return img;
};
