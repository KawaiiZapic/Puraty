import { FC, type BaseProps } from "tsx-dom"
import { router } from ".";


export const RouterLink: FC<{ href: string, class?: string } & BaseProps> = (props) => {
  const handler = (e: MouseEvent) => {
    e.preventDefault();
    if (!router.matchLocation(props.href)) {
      router.navigate(props.href);
    }
  }
  return <a class={props.class} onClick={handler}>{ props.children }</a>
};