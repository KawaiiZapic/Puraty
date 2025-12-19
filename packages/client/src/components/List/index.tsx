import type { FunctionalComponent } from "preact";

import { useRouter } from "@/router";

import style from "./List.module.css";

export const List: FunctionalComponent<{
	withIcon?: boolean;
}> = attr => {
	return (
		<ul class={`${style.listWrapper} ${attr.withIcon && style.listWithIcon}`}>
			{attr.children}
		</ul>
	);
};

interface ListItemProps {
	href?: string;
	onClick?: (e: MouseEvent) => void;
}

export const ListItem: FunctionalComponent<ListItemProps> = attr => {
	const { href, onClick } = attr;
	const router = useRouter();
	const handleClick = (e: MouseEvent) => {
		if (href) {
			setTimeout(() => {
				router.navigate(href);
			}, 100);
		} else if (onClick) {
			onClick(e);
		}
	};
	return (
		<li class={`clickable-item ${style.listItem}`} onClick={handleClick}>
			{attr.children}
		</li>
	);
};

export const ListTitle: FunctionalComponent = attr => {
	return <div class={style.listTitle}>{attr.children}</div>;
};

export const ListIcon: FunctionalComponent<{ icon?: string }> = attr => {
	return <img src={attr.icon} class={style.listIcon}></img>;
};
