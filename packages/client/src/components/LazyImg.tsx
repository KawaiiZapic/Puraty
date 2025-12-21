import { Component } from "preact";

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

export class LazyImg extends Component<
	Partial<HTMLImageElement> & { class?: string }
> {
	shouldComponentUpdate() {
		return false;
	}

	render() {
		const attr = this.props;
		const ref = createRef<HTMLImageElement>();
		const newAttr: Record<string, unknown> = {};
		for (const key in attr) {
			if (key !== "src") {
				// @ts-expect-error complex merging
				newAttr[key] = attr[key];
			} else if (attr.src) {
				newAttr["data-lazy-src"] = attr.src;
			}
		}
		newAttr.ref = ref;

		useEffect(() => {
			const curr = ref.current;
			if (!curr) return;
			io.observe(curr);
			return () => io.unobserve(curr);
		}, [ref]);
		return h("img", newAttr, null);
	}
}
