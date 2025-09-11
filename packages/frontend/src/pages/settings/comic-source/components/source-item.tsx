import type { SourceDetail } from "@/api/comic-source";
import style from "./source-item.module.css";
import api from "@/api";

export default ({ item, installedVersion }: { item: SourceDetail, installedVersion?: string }) => {
  const InsBtn =
    () => {
      let ins = installedVersion === item.version;
      const doInstall = () => {
        if (ins) return;
        ins = true;
        el.textContent = "正在安装";
        api.ComicSource.install(item.fileName, item.key).then(v => {
          el.textContent = "已安装";
        }).catch(() => { ins = false; el.textContent = (!installedVersion ? "安装" : "升级") });
      };
      const el = <div onClick={doInstall} class={["clickable-item"]}>
        { ins ? `已安装` : (!installedVersion ? "安装" : "升级") }
      </div>;
      return el;
    }
  return <div class={style.listItemWrapper}>
    <div class={style.listItemMeta}>
      <div>{item.name}</div>
      <div class={style.listItemDesc}>{(!installedVersion || item.version === installedVersion) ? item.version : "可升级: " + item.version} {item.description ? " - " + item.description : ""}</div>
    </div>
    <InsBtn />
  </div>;
}