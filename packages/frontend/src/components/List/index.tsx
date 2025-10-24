import type { BaseProps } from "@puraty/render";

import { router } from "@/router";

import style from "./List.module.css";

export const List = (attr: BaseProps) => {
	return <ul class={style.listWrapper}>{attr.children}</ul>;
};

interface ListItemProps extends BaseProps {
	href?: string;
	onClick?: (e: MouseEvent) => void;
}

export const ListItem = (attr: ListItemProps) => {
	const { href, onClick } = attr;
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
		<li class={["clickable-item", style.listItem]} onClick={handleClick}>
			{attr.children}
		</li>
	);
};
