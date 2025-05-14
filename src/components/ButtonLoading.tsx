import { Show, type Component, type JSX } from "solid-js";
import SpinnerIcon from "@components/icons/SpinnerIcon";

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
            <SpinnerIcon class="animate-spin h-5 w-5 text-current" />
          </div>
        </Show>
      </div>
    </button>
  );
};

export default LoadingButton;
