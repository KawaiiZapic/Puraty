import type { FunctionalComponent } from "preact";

import { RouterLink } from "@/router/RouterLink";

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

export const ListItem: FunctionalComponent<ListItemProps> = ({
	href,
	onClick,
	children
}) => {
	return href ? (
		<RouterLink class={`clickable-item ${style.listItem}`} href={href}>
			{children}
		</RouterLink>
	) : (
		<div class={`clickable-item ${style.listItem}`} onClick={onClick}>
			{children}
		</div>
	);
};

export const ListTitle: FunctionalComponent = attr => {
	return <div class={style.listTitle}>{attr.children}</div>;
};

export const ListIcon: FunctionalComponent<{ icon?: string }> = attr => {
	return <img src={attr.icon} class={style.listIcon}></img>;
};
