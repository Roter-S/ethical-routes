import { createEffect, createSignal } from "solid-js";

interface BranchNode {
  question?: string;
  branches?: Record<string, BranchNode>;
  conclusion?: string;
  advice?: string;
  comentario_final?: string;
}

interface EthicalRouteTreeProps {
  tree: {
    documentId: string;
    question: string;
    branches: Record<string, BranchNode>;
  };
}

interface Step {
  question: string;
  answer: string;
}

export default function EthicalRouteTree(props: EthicalRouteTreeProps) {
  const [currentNode, setCurrentNode] = createSignal<BranchNode>({
    question: props.tree.question,
    branches: props.tree.branches,
  });
  const [history, setHistory] = createSignal<Step[]>([]);
  const [finished, setFinished] = createSignal(false);
  const [result, setResult] = createSignal<BranchNode | null>(null);

  function handleOption(optionKey: string) {
    const node = currentNode();
    if (!node.branches) return;
    const nextNode = node.branches[optionKey];
    setHistory([...history(), { question: node.question || "", answer: optionKey }]);
    if (nextNode.conclusion) {
      setResult(nextNode);
      setFinished(true);
    } else {
      setCurrentNode(nextNode);
    }
  }

  function handleRestart() {
    setCurrentNode({ question: props.tree.question, branches: props.tree.branches });
    setHistory([]);
    setFinished(false);
    setResult(null);
  }


  const maxSteps = 6;
  const progress = Math.min(100, ((history().length + (finished() ? 1 : 0)) / maxSteps) * 100);

  createEffect(() => {
    if (finished()) {
      fetch(`/api/ethical-routes/${props.tree.documentId}/participation`, {
        method: 'POST',
      })
        .then(res => {
          if (!res.ok) throw new Error('Falló la actualización');
          console.log('Participations incrementado');
        })
        .catch(err => console.warn(err));
    }
  });

  return (
    <div class="w-full flex flex-col items-center">
      {history().length > 0 && !finished() && (
        <div class="mb-4 w-full flex items-center gap-2">
          <div class="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span class="text-xs text-zinc-500 dark:text-zinc-300">
            Paso {history().length + 1}
          </span>
        </div>
      )}

      {!finished() ? (
        <div class="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 mb-6 animate-fade-in">
          <h2 class="text-xl font-semibold mb-6 text-violet-700 dark:text-violet-300 text-center">
            {currentNode().question}
          </h2>
          <div class="flex flex-col gap-4">
            {currentNode().branches
              ? Object.entries(currentNode().branches ?? {}).map(([key]) => (
                <button
                  class="w-full flex items-center justify-between py-4 px-6 rounded-xl bg-gradient-to-r from-violet-100 to-blue-100 dark:from-violet-900/40 dark:to-blue-900/40 border border-violet-200 dark:border-violet-700 shadow-md hover:scale-[1.03] hover:shadow-xl transition-all duration-200 group"
                  onClick={() => handleOption(key)}
                >
                  <span class="text-lg font-semibold text-violet-800 dark:text-violet-200">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <svg class="w-6 h-6 text-violet-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))
              : null}
          </div>

          {history().length > 0 && (
            <div class="mt-8 flex flex-wrap gap-2 justify-center">
              {history().map((step) => (
                <span class="px-3 py-1 rounded-full bg-violet-200 dark:bg-violet-800 text-violet-900 dark:text-violet-100 text-xs font-semibold">
                  {step.answer}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div class="w-full max-w-xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/60 dark:to-blue-900/60 rounded-2xl shadow-2xl p-10 animate-fade-in flex flex-col items-center border-2 border-violet-300 dark:border-violet-700">
          <div class="mb-4">
            <svg class="w-16 h-16 text-violet-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold mb-2 text-violet-800 dark:text-violet-200 text-center">
            {result()?.conclusion}
          </h2>
          <p class="text-lg mb-4 text-blue-900 dark:text-blue-200 text-center font-medium">
            {result()?.advice}
          </p>
          <p class="italic text-zinc-700 dark:text-zinc-300 mb-6 text-center">
            {result()?.comentario_final}
          </p>
          <div class="flex flex-wrap gap-2 mb-4">
            {history().map((step) => (
              <span class="px-3 py-1 rounded-full bg-violet-200 dark:bg-violet-800 text-violet-900 dark:text-violet-100 text-xs font-semibold">
                {step.answer}
              </span>
            ))}
          </div>
          <button
            class="mt-2 px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold shadow transition-all"
            onClick={handleRestart}
          >
            Volver a empezar
          </button>
        </div>
      )}

      {history().length > 0 && (
        <div class="w-full flex flex-col items-center my-8">
          <div class="relative w-full max-w-md">
            {history().map((step, idx) => (
              <div class="flex items-center relative" style={{ "min-height": "48px" }}>
                {idx !== 0 && (
                  <div class="absolute left-5 top-0 h-full w-px bg-violet-300 dark:bg-violet-700" style={{ "z-index": 0 }} />
                )}
                <div class="z-10 flex flex-col items-center">
                  <div class="w-4 h-4 rounded-full bg-violet-500 border-2 border-white dark:border-zinc-900 shadow" />
                  <span class="text-xs text-zinc-500 mt-1">{idx + 1}</span>
                </div>
                <div class="ml-6 flex flex-col">
                  <span class="text-sm font-semibold text-violet-800 dark:text-violet-200">{step.question}</span>
                  <span class="text-xs text-blue-700 dark:text-blue-300 italic">→ {step.answer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 