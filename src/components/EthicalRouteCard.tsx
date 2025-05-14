import type { EthicalRouteWithDifference } from "@lib/types";
import { formatDate } from "@lib/utils";
import { Show } from "solid-js";

interface EthicalRouteCardProps {
  route: EthicalRouteWithDifference;
}

export function EthicalRouteCard(props: EthicalRouteCardProps) {
  return (
    <li class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div class="flex flex-col md:flex-row justify-between relative">
        <div class="p-4 flex-1 space-y-2">
          <div class="flex flex-col md:flex-row md:items-center gap-2">
            <a
              href={`/edit/${props.route.documentId}`}
              class="text-zinc-800 dark:text-white text-lg font-medium group inline-flex items-center transition-colors duration-200"
            >
              <span class="relative overflow-hidden">
                {props.route.question}
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
            <Show when={props.route.participations >= 0} fallback={null}>
              <span class="text-xs md:ml-2 px-2 py-0.5 font-semibold rounded-full whitespace-nowrap bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 flex items-center justify-center">
                <span class="mr-1">•</span>
                Participaciones: {props.route.participations}
              </span>
            </Show>
          </div>

          <p class="text-sm text-zinc-600 dark:text-zinc-300 mb-1">
            {props.route.description}
          </p>
        </div>
        <div class="flex items-center justify-center bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 text-sm font-medium p-4 md:min-w-[100px]">
          <div class="flex flex-col items-center">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">Creado</span>
            <span class="font-semibold mt-1">
              {formatDate(props.route.created_at)}
            </span>
          </div>
        </div>

        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 pointer-events-none hover:opacity-10 transition-opacity duration-300"></div>
      </div>
    </li>
  );
}
