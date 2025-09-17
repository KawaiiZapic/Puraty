import { computed, reactive, toRef, watch } from "@puraty/reactivity";

export default (onRetry: () => void) => {
  const state = reactive({
    loading: true,
    errorMsg: ""
  });
  const disabled = toRef(state, "loading");

  const btnText = computed(({ loading }) => {
    return loading ? "正在加载" : "重试";
  }, state);
  const btnStyle = computed(({ errorMsg }) => {
    return !errorMsg ? "display: none" : "";
  }, state);

  const wrapperStyle = computed(({ loading, errorMsg }) => {
    return !!errorMsg || loading ? "padding: 2rem 0; text-align: center" : "display: none";
  }, state);

  const tipText = computed(({ errorMsg }) => {
    return errorMsg || "正在加载...";
  }, state);
  const $ = <div style={wrapperStyle}>
    <div class="padding: 1.5rem 0">{ tipText }</div>
    <button style={ btnStyle } disabled={ disabled } onClick={() => {onRetry()}}>
      { btnText }
    </button>
  </div>;

  return {
    state,
    $
  };
}