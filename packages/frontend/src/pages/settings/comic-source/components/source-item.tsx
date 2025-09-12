import type { SourceDetail } from "@/api/comic-source";
import style from "./source-item.module.css";
import api from "@/api";
import { rNode } from "@/utils/Reactive";

export default ({ item, installedVersion }: { item: SourceDetail, installedVersion?: string }) => {
  const InsBtn =
    () => {
      let loading = false;
      const { state, $: BtnText } = rNode(
        ({ loading, installedVersion }) => {
          if (loading) {
            return <>正在安装</>;
          }
          if (installedVersion === item.version) {
            return <>已安装</>;
          } else {
            return <>{ !!installedVersion ? "升级" : "安装" }</>;
          }
        }, 
        {
          loading: false,
          installedVersion
        }
      );
      const doInstall = () => {
        if (loading || installedVersion === item.version) return;
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
        <BtnText />
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