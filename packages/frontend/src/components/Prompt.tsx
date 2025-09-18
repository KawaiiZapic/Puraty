import style from "./Prompt.module.css";

export interface PromptOptions {}

export interface PromptField {
  title?: string;
  key: string;
  type?: "string"
}

export const Prompt = function<const T extends PromptField[]>(fields: T, title?: string, options?: PromptOptions): Promise<Record<T[number]["key"], string | undefined>> {
  return new Promise((resolve, reject) => {
    const $fields = <form></form> as HTMLFormElement;
    fields.forEach((field) => {
      const $f = <div class={style.promptField}>
        <div class={style.promptFieldTitle}>{ field.title ?? field.key }</div>
      </div>;
      $f.appendChild(<input name={field.key}></input>)
      $fields.appendChild($f);
    });
    const onCancel = () => {
      $.parentNode?.removeChild($);
      reject("cancel");
    }
    const handleLayerOnclick = (e: MouseEvent) => {
      if (e.target !== $) return;
      onCancel();
    }

    const onSubmit = () => {
      const f = new FormData($fields);
      const r: Record<string, string | undefined> = {};
      fields.forEach((field) => {
        r[field.key] = f.get(field.key)?.toString();
      });
      resolve(r);
      $.parentNode?.removeChild($);
    };
    const $ = <div class={style.promptLayer} onClick={handleLayerOnclick}>
      <div class={style.promptDialog}>
        <div class={ style.promptTitle }>{ title }</div>
        { $fields }
        <div class={style.promptBottom}>
          <button onClick={onCancel}>取消</button>
          <button onClick={onSubmit}>提交</button>
        </div>
      </div>
    </div>;
    document.body.appendChild($);
  });
}