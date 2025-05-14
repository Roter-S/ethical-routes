import { For, Show } from "solid-js";
import { EthicalRouteCard } from "./EthicalRouteCard";
import type { EthicalRouteWithDifference } from "@lib/types";

interface EthicalRouteListProps {
  routes: EthicalRouteWithDifference[];
}

export default function EthicalRouteList(props: EthicalRouteListProps) {
  return (
    <div>
      <Show
        when={props.routes.length === 0}
        fallback={
          <ul class="w-full grid grid-cols-1 gap-6 max-w-xl pb-4">
            <For each={props.routes}>
              {(route) => <EthicalRouteCard route={route} />}
            </For>
          </ul>
        }
      >
        <p class="text-gray-500">No hay rutas éticas disponibles.</p>
      </Show>
    </div>
  );
}
