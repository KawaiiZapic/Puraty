import { RouterLink } from "@/router/RouterLink"
import style from "./index.module.css";

export default () => {
  return <div>
    <RouterLink href="/settings/comic-sources" class={ style.listItem }>
      管理漫画源
    </RouterLink>
  </div>
}