import { FC, type BaseProps } from "tsx-dom"
import { router } from ".";


export const RouterLink: FC<{ href: string, class?: string | string[] | Record<string, boolean> } & BaseProps> = (props) => {
  const handler = (e: MouseEvent) => {
    e.preventDefault();
    // a 100 ms delay to show a click response to user
    setTimeout(() => {
      if (!router.matchLocation(props.href)) {
        router.navigate(props.href);
      }
    }, 100);
  }
  return <a class={props.class} onClick={handler}>{ props.children }</a>
};