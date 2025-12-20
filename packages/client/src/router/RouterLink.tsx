import { type FunctionalComponent } from "preact";
import { useCallback } from "preact/hooks";

import { useRouter } from ".";

export const RouterLink: FunctionalComponent<{
	href: string;
	class?: string;
}> = props => {
	const router = useRouter();
	const handler = useCallback((e: MouseEvent) => {
		e.preventDefault();
		// a 100 ms delay to show a click response to user
		setTimeout(() => {
			if (!router.__router.matchLocation(props.href)) {
				router.navigate(props.href);
			}
		}, 100);
	}, []);
	return (
		<a class={props.class} onClick={handler} href={props.href}>
			{props.children}
		</a>
	);
};
