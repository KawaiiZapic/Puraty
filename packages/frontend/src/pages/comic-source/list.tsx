import api from "@/api";
import style from "./list.module.css";

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
              api.ComicSource.install(item.fileName, item.key).then(v => {
                el.textContent = "已安装: " + item.version;
              }).catch(() => { ins = false; });
            };
            const el = <div onClick={doInstall}>安装</div>;
            return el;
          }
        }
      const el = <div class={style.listItemWrapper}>
        <div class={style.listItemMeta}>
          <div>{ item.name }</div>
          <div>{ item.version } { item.description }</div>
        </div>
        <InsBtn />
      </div>
      list.appendChild(el);
    });
  });
  return list;
}