import { Show, type Component, type JSX } from "solid-js";

type LoadingButtonProps = {
  loading: boolean;
  onClick?: (e: MouseEvent) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  class?: string;
  classList?: Record<string, boolean>;
  children: JSX.Element;
  loadingText?: string;
};

const LoadingButton: Component<LoadingButtonProps> = (props) => {
  const baseDisabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";
  const combinedClass = () => {
    let classes = props.class ? `${props.class} ${baseDisabledClasses}` : baseDisabledClasses;
    if (props.classList) {
      for (const key in props.classList) {
        if (Object.prototype.hasOwnProperty.call(props.classList, key) && props.classList[key]) {
          classes += ` ${key}`;
        }
      }
    }
    return classes;
  };

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      class={combinedClass()}
    >
      <div class="flex items-center justify-center">
        <Show when={props.loading} fallback={props.children}>
          <div class="flex items-center justify-center gap-2">
            <span>{props.loadingText ?? "Cargando"}</span>
            <svg
              class="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8.009,8.009,0,0,1,12,20Z"
              />
              <path
                fill="currentColor"
                d="M10.14,2.93a10.007,10.007,0,0,1,.4.4l-.4-.4Z"
              />
            </svg>
          </div>
        </Show>
      </div>
    </button>
  );
};

export default LoadingButton;
