import type { BaseProps } from "@puraty/render";

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
	setTimeout(() => {
		const scrollingView =
			document.scrollingElement!.scrollTop + window.innerHeight;
		const boundingTop = img.offsetTop;
		if (scrollingView > boundingTop) {
			img.src = attr.src!;
		} else {
			img.setAttribute("data-lazy-src", attr.src!);
		}
	});
	return img;
};

window.addEventListener("scroll", () => {
	const scrollingView =
		document.scrollingElement!.scrollTop + window.innerHeight;
	document.querySelectorAll("img[data-lazy-src]").forEach(img => {
		const boundingTop = (img as HTMLElement).offsetTop;
		if (scrollingView > boundingTop) {
			img.setAttribute("src", img.getAttribute("data-lazy-src")!);
			img.removeAttribute("data-lazy-src");
		}
	});
});
