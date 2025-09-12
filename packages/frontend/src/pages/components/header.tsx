import style from "./header.module.css";
import CloseFilled from "@sicons/material/CloseFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import api from "@/api";
import { RouterLink } from "@/router/RouterLink";
import { lastMatched, router } from "@/router";

export default () => {
  const toHome = () => {
    if (isBack) {
      if (history.length === 0) {
        router.navigate("/");
      } else {
        history.go(-1);
      }
      
    } else {
      api.Command.exit();
    }
  }
  let isBack = false;
  const btnIcon = <img src={ CloseFilled }></img> as HTMLImageElement;
  const onRouteUpdate = () => {
    isBack = lastMatched?.path !== "/";
    if (isBack) {
      btnIcon.src = ChevronLeftFilled;
    } else {
      btnIcon.src = CloseFilled;
    }
  }
  window.addEventListener("route-update", onRouteUpdate);
  onRouteUpdate();
  return <div class={ style.wrapper }>
    <div onClick={ toHome } class={ [style.iconBtn, "clickable-item"] } >
      { btnIcon }
    </div>
    <RouterLink href="/settings" class={ [style.iconBtn, "clickable-item"] } >
      <img src={ SettingsFilled }></img>
    </RouterLink>
  </div>;
}