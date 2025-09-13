import type { SourceDetail } from "@/api/comic-source";
import style from "./source-item.module.css";
import api from "@/api";
import { computed, reactive } from "@puraty/reactivity";

export default ({ item, installedVersion }: { item: SourceDetail, installedVersion?: string }) => {
  const InsBtn =
    () => {
      const state = reactive({
        loading: false,
        installedVersion
      });
      const updateBtnStateText = computed(({ loading, installedVersion }) => {
        if (loading) {
          return "正在安装";
        }
        if (installedVersion === item.version) {
          return "已安装";
        } else {
          return !!installedVersion ? "升级" : "安装" 
        };
      }, state);
      const doInstall = () => {
        if (state.loading || state.installedVersion === item.version) return;
        state.loading = true;
        api.ComicSource.install(item.fileName, item.key)
          .then(() => {
            state.installedVersion = item.version;
          })
          .finally(() => {
            state.loading = false;
          });
      };
      return <div onClick={doInstall} class={["clickable-item", style.listItemBtn]}>
        { updateBtnStateText }
      </div>;
    }
  return <div class={style.listItemWrapper}>
    <div class={style.listItemMeta}>
      <div>{item.name}</div>
      <div class={style.listItemDesc}>{
        (!installedVersion || item.version === installedVersion) ? item.version : "可升级: " + item.version
      } {item.description ? " - " + item.description : ""}</div>
    </div>
    <InsBtn />
  </div>;
}