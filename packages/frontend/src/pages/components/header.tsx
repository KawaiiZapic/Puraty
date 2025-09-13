import style from "./header.module.css";
import CloseFilled from "@sicons/material/CloseFilled.svg";
import SettingsFilled from "@sicons/material/SettingsFilled.svg";
import ChevronLeftFilled from "@sicons/material/ChevronLeftFilled.svg";
import api from "@/api";
import { RouterLink } from "@/router/RouterLink";
import { lastMatched, router } from "@/router";
import { ref } from "@puraty/reactivity";

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
  const backIconUrl = ref(CloseFilled);
  const onRouteUpdate = () => {
    isBack = lastMatched?.path !== "/";
    if (isBack) {
      backIconUrl.value = ChevronLeftFilled;
    } else {
      backIconUrl.value = CloseFilled;
    }
  }
  window.addEventListener("route-update", onRouteUpdate);
  onRouteUpdate();
  return <div class={ style.wrapper }>
    <div onClick={ toHome } class={ [style.iconBtn, "clickable-item"] } >
      <img src={ backIconUrl }></img>
    </div>
    <RouterLink href="/settings" class={ [style.iconBtn, "clickable-item"] } >
      <img src={ SettingsFilled }></img>
    </RouterLink>
  </div>;
}