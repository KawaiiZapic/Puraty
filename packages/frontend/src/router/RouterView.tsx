import { router } from ".";

let currentLevel = -1;

const getEl = () => {
	currentLevel += 1;
	try {
		return (
			router.matched[currentLevel]?.component(void 0 as never) ??
			document.createComment("")
		);
	} finally {
		currentLevel -= 1;
	}
};

export const RouteView = () => {
	let el = getEl();
	const stop = router.beforeEnter(() => {
		if (!el.parentNode) {
			stop();
			return;
		}
		const newEl = getEl();
		el.parentNode.replaceChild(newEl, el);
		el = newEl;
	});
	return el;
};
