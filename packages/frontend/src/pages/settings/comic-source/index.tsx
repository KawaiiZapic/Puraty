import api from "@/api";
import SourceItem from "./components/source-item";
import LoadingWrapper from "@/components/LoadingWrapper";

export default () => {
  const load = () => {
    state.loading = true;
    Promise.all([
      api.ComicSource.available(),
      api.ComicSource.list()
    ]).then(([available, installed]) => {
      state.errorMsg = "";
      available.forEach(item => {
        list.appendChild(SourceItem({ item, installedVersion: installed[item.key] }));
      });
    }).catch(() => {
      state.errorMsg = "加载列表失败";
    }).finally(() => {
      state.loading = false;
    });
  };
  const { state, $: loadingWrapper } = LoadingWrapper(load);
  load();
  const list = <div>
    { loadingWrapper }
  </div>;
  
  return list;
}