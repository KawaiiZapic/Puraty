import api from "@/api";
import style from "./index.module.css";

export default () => {
  const list = <div />;
  Promise.all([
    api.ComicSource.available(),
    api.ComicSource.installed()
  ]).then(([available, installed]) => {
    available.forEach(item => {
      const InsBtn = 
        () => {
          let ins = false;
          if (item.key in installed) {
            return <div>已安装: {installed[item.key]}</div>;
          } else {
            const doInstall = () => {
              if (ins) return;
              ins = true;
              el.textContent = "正在安装";
              api.ComicSource.install(item.fileName, item.key).then(v => {
                el.textContent = "已安装: " + item.version;
              }).catch(() => { ins = false; el.textContent = "安装" });
            };
            const el = <div onClick={doInstall} class={[ "clickable-item" ]}>安装</div>;
            return el;
          }
        }
      const el = <div class={style.listItemWrapper}>
        <div class={style.listItemMeta}>
          <div>{ item.name }</div>
          <div class={ style.listItemDesc }>{ item.version } { item.description ? " - " + item.description : ""}</div>
        </div>
        <InsBtn />
      </div>
      list.appendChild(el);
    });
  });
  return list;
}