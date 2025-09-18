import { getCurrentRoute } from "@/router"
import api from "@/api";
import { Checkbox, Input, Select } from "@/components/InputModel";
import { reactive, ref, toRef, watch, type Ref } from "@puraty/reactivity";
import style from "./config.module.css"
import { Prompt } from "@/components/Prompt";
export default () => {
  const id = getCurrentRoute()?.data?.id!;
  
  const $ = <div>
  </div>
  api.ComicSource.get(id).then(v => {
    if (!v.isLogged) {
      if (v.features.UAPLogin) {
        const onClick = () => {
          Prompt([
            {
              key: "username",
              title: "用户名"
            },
            {
              key: "password",
              title: "密码"
            }
          ], "登录").then(async (v) => {
            if (!v.username || !v.password) return;
            await api.ComicSource.doUAPLogin(id, v.username, v.password);
          });
        }
        $.appendChild(<div class={style.sourceConfigItem}>
          用户名密码登录
          <button onClick={onClick}>登录</button>
        </div>);
      }
      if (v.features.CookieLogin) {
        const onClick = () => {
          Prompt(v.features.CookieLogin!.map(key => ({ key })), "Cookie 登录").then(async (v) => {
            await api.ComicSource.doCookieLogin(id, v);
          });
        }
        $.appendChild(<div class={style.sourceConfigItem}>
          Cookie 登录
          <button onClick={onClick}>登录</button>
        </div>);
      }
    } else if (v.features.logout) {
      const onClick = () => {
        api.ComicSource.logout(id);
      }
      $.appendChild(<div class={style.sourceConfigItem}>
          已登录
          <button onClick={onClick}>退出登录</button>
        </div>);
    }

    const result = reactive(v.settingValues) as Record<string, string>;
    for (const k in v.settings) {
      const s = v.settings[k];
      if (!(k in result) && s.type !== "callback" && s.default) {
        result[k] = String(s.default);
      }
      if (s.type === "input") {
        const v = toRef(result, k);
        $.appendChild(<div class={style.sourceConfigItem}>
          { s.title }
          <Input name={k} modelValue={v}></Input>
        </div>)
      } else if (s.type === "switch") {
        const v = toRef(result, k);
        $.appendChild(<div class={style.sourceConfigItem}>
          { s.title }
          <Checkbox name={k} type="checkbox" modelValue={v}></Checkbox>
        </div>)
      } else if (s.type === "select") {
        const v = toRef(result, k) as Ref<string>;
        const $opts = s.options?.map(opt => {
          return <option value={opt.value}>{ opt.text ?? opt.value }</option>
        });
        const $select = <Select name={k} modelValue={ v }> { $opts } </Select>;
        ;
        $.appendChild(<div class={style.sourceConfigItem}>
          { s.title }
          { $select }
        </div>)
      } else if (s.type === "callback") {
        let isRunning = ref(false);
        const cb = async () => {
          if (isRunning.value) return;
          isRunning.value = true;
          try {
            await api.ComicSource.execCallback(id, k);
          } finally {
            isRunning.value = false;
          }
        }
        $.appendChild(<div class={style.sourceConfigItem}>
          { s.title }
          <button disabled={isRunning} onClick={cb}>{ s.buttonText ?? "执行" }</button>
        </div>)
      }
    }
    watch(result, () => {
      api.ComicSource.modify(id, {
        settingValues: result
      });
    });
  });
  
  return $;
}