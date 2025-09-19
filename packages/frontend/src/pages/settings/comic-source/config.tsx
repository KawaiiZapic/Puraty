import { getCurrentRoute } from "@/router"
import api from "@/api";
import { Checkbox, Input, Select } from "@/components/InputModel";
import { reactive, ref, toRef, watch, type Ref } from "@puraty/reactivity";
import style from "./config.module.css"
import { Prompt } from "@/components/Prompt";
import type { InstalledSourceDetail } from "@puraty/server";
import { Alert } from "@/components/Alert";
export default () => {
  const id = getCurrentRoute()?.data?.id!;
  const loginGroup= <div></div>;
  
  const $ = <div>
    { loginGroup }
  </div>

  const updateLoginStatus = (v: InstalledSourceDetail) => {
    loginGroup.childNodes.forEach(v => loginGroup.removeChild(v));
    const isLoading = ref(false);
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
          ], "登录").then(async (r) => {
            if (!r.username || !r.password) return;
            isLoading.value = true;
            try {
              await api.ComicSource.doUAPLogin(id, r.username, r.password);
              v.isLogged = true;
              updateLoginStatus(v);
              Alert("登录成功");
            } catch(e) {
              
              Alert("登录失败: " + api.normalizeError(e));
            } finally {
              isLoading.value = false;
            }
          });
        }
        loginGroup.appendChild(<div class={style.sourceConfigItem}>
          用户名密码登录
          <button disabled={isLoading} onClick={onClick}>登录</button>
        </div>);
      }
      if (v.features.CookieLogin) {
        const onClick = () => {
          Prompt(v.features.CookieLogin!.map(key => ({ key })), "Cookie 登录").then(async (r) => {
            isLoading.value = true;
            try {
              await api.ComicSource.doCookieLogin(id, r);
              v.isLogged = true;
              updateLoginStatus(v);
              Alert("登录成功");
            } catch(e) {
              Alert("登录失败: " + api.normalizeError(e));
            } finally {
              isLoading.value = false;
            }
          });
        }
        loginGroup.appendChild(<div class={style.sourceConfigItem}>
          Cookie 登录
          <button disabled={isLoading} onClick={onClick}>登录</button>
        </div>);
      }
    } else if (v.features.logout) {
      const onClick = async () => {
        isLoading.value = true;
        try {
          await api.ComicSource.logout(id);
          v.isLogged = false;
          updateLoginStatus(v);
          Alert("已退出登录");
        } catch(e) {
          Alert("无法退出登录: "  + api.normalizeError(e));
          console.error(e);
        } finally {
          isLoading.value = false;
        }
      }
      loginGroup.appendChild(<div class={style.sourceConfigItem}>
          已登录
          <button disabled={isLoading} onClick={onClick}>退出登录</button>
        </div>);
    }
  }
  api.ComicSource.get(id).then(v => {
    updateLoginStatus(v);
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