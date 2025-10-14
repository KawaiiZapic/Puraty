import { shiftRouteViewTree } from ".";

export const RouteView = () => {
	let el = shiftRouteViewTree()?.component({}) ?? document.createComment("");
	window.addEventListener("route-update", () => {
		if (!el.parentNode) return;
		const newEl =
			shiftRouteViewTree()?.component({}) ?? document.createComment("");
		el.parentNode?.replaceChild(newEl, el);
		el = newEl;
	});
	return el;
};
