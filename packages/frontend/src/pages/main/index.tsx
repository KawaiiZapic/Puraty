import api from "@/api";
import { RouterLink } from "@/router/RouterLink";

export default () => {
  api.ComicSource.list().then((source) => {
    Object.keys(source).forEach((key) => {
      el.appendChild(<div><RouterLink href={ "/source/" + key }>{ key }</RouterLink></div>)
    })
  });
  const el = <div></div>;
  return el;
}