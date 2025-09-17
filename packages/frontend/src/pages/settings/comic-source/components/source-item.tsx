import style from "./source-item.module.css";
import api from "@/api";
import { RouterLink } from "@/router/RouterLink";
import { computed, reactive, watch } from "@puraty/reactivity";
import type { NetworkSourceDetail } from "@puraty/server";

export default ({ item, installedVersion }: { item: NetworkSourceDetail, installedVersion?: string }) => {
  const state = reactive({
    loading: false,
    installedVersion
  });
  const ConfigBtn = () => {
    let $: Node = document.createComment("");
    watch(state, () => {
      let $new: Node;
      if (state.installedVersion) {
        $new = <RouterLink href={ "/settings/comic-sources/" + item.key }>
          设置
        </RouterLink>
      } else {
        $new = document.createComment("");
      }
      $.parentNode?.replaceChild($new, $);
      $ = $new;
    }, { immediate: true });
    return $;
  }
  const InsBtn =
    () => {
      const updateBtnStateText = computed(({ loading, installedVersion }) => {
        let res = "";
        if (installedVersion === item.version) {
          res = "卸载";
        } else {
          res = !!installedVersion ? "升级" : "安装" 
        };
        if (loading) {
          res = "正在" + res;
        }
        return res;
      }, state);
      const doInstall = () => {
        if (state.loading) return;
        state.loading = true;
        if (state.installedVersion !== item.version) {
          api.ComicSource.add(item.fileName, item.key)
            .then(() => {
              state.installedVersion = item.version;
            })
            .finally(() => {
              state.loading = false;
            });
        } else {
          api.ComicSource.delete(item.key)
            .then(() => {
              state.installedVersion = undefined;
            })
            .finally(() => {
              state.loading = false;
            });
        }
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
    <ConfigBtn />
    <InsBtn />
  </div>;
}