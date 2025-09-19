import style from "./Alert.module.css";
import InfoFilled from "@sicons/material/InfoFilled.svg";

let $wrapper: Node;

export const Alert = (msg: string) => {
  if (!$wrapper) {
    $wrapper = <div class={style.alertLayer}></div>;
    document.body.appendChild($wrapper);
  }

  const msgBody = <div class={style.alertWrapper}>
    <div class={style.alertIcon}>
      <img src={InfoFilled}></img>
    </div>
    <div>{msg}</div>
  </div>

  $wrapper.appendChild(msgBody);
  setTimeout(() => {
    $wrapper.removeChild(msgBody);
  }, 3000);
}