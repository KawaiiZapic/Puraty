import api from "@/api";
import { getCurrentRoute } from "@/router";
import { RouterLink } from "@/router/RouterLink";

export default () => {
  const route = getCurrentRoute();
  const id = route?.data?.id;
  const root = <div></div>;
  (async () => {
    if (!id) return;
    const detail = await api.ComicSource.get(id);
    detail.explore?.forEach((e) => {
      root.appendChild(<div><RouterLink href={ `/source/${id}/explore/${e.id}` } >{ e.title }</RouterLink></div>)
    })
  })();
  return root;
}