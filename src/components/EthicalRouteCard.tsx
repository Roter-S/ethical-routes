import type { EthicalRouteWithDifference } from "@lib/types";
import { formatDate } from "@lib/utils";
import { Show } from "solid-js";

interface EthicalRouteCardProps {
  route: EthicalRouteWithDifference;
}

export function EthicalRouteCard(props: EthicalRouteCardProps) {
  return (
    <li class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md p-4 flex justify-between items-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-200">
      <div class="space-y-1 flex-1">
        <p class="flex items-center gap-2">
          <a
            href={`/edit/${props.route.documentId}`}
            class="text-zinc-800 dark:text-white text-lg font-medium hover:underline"
          >
            {props.route.question}
          </a>
          <Show when={props.route.participations > 1} fallback={null}>
            <span class="text-xs leading-none align-middle px-2 py-0.5 font-semibold rounded uppercase bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
              Participaciones: {props.route.participations}
            </span>
          </Show>
        </p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          {props.route.description}
        </p>
      </div>

      <div class="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-700 py-1 px-2 rounded text-zinc-600 dark:text-zinc-400 text-sm leading-tight">
        <span class="font-semibold leading-none">Creado:</span>
        <span class="leading-none">{formatDate(props.route.created_at)}</span>
      </div>
    </li>
  );
}
