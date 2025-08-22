import style from "./header.module.css";
import CloseFilled from "@sicons/material/CloseFilled.svg";
import RefreshFilled from "@sicons/material/RefreshFilled.svg";

export default () => {
  const toHome = () => {
    kindle.appmgr.start("com.lab126.booklet.home");
  }
  return <div class={ style.wrapper }>
    <div onClick={ toHome } class={ style.iconBtn } >
      <img src={ CloseFilled }></img>
    </div>
    <div onClick={ () => location.reload() } class={ style.iconBtn } >
      <img src={ RefreshFilled }></img>
    </div>
  </div>;
}