import api from "@/api";
import SourceItem from "./components/source-item";

export default () => {
  const list = <div />;
  Promise.all([
    api.ComicSource.available(),
    api.ComicSource.installed()
  ]).then(([available, installed]) => {
    available.forEach(item => {
      list.appendChild(SourceItem({ item, installedVersion: installed[item.key] }));
    });
  });
  return list;
}