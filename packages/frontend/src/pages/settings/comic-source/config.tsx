import { getCurrentRoute } from "@/router"
import api from "@/api";
import { Checkbox, Input, Select } from "@/pages/components/InputModel";
import { reactive, ref, toRef, watch, type Ref } from "@puraty/reactivity";
import style from "./config.module.css"
export default () => {
  const id = getCurrentRoute()?.data?.id!;
  
  const $ = <div>
  </div>
  api.ComicSource.get(id).then(v => {
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