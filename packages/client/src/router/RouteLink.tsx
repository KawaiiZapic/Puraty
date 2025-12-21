import type { FunctionalComponent } from "preact";

export const RouteLink: FunctionalComponent<{
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
		}, 200);
	}, []);
	return (
		<a class={props.class} onClick={handler} href={props.href}>
			{props.children}
		</a>
	);
};
