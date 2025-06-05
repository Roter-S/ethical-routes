import { createSignal, onMount } from "solid-js";
import { EditorView } from "codemirror";
import type { ViewUpdate } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  class?: string;
}

export default function JsonEditor(props: JsonEditorProps) {
  const [isValid, setIsValid] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  let editorRef: HTMLDivElement | undefined;

  const jsonLinter = linter((view: EditorView): Diagnostic[] => {
    const errors: Diagnostic[] = [];
    try {
      JSON.parse(view.state.doc.toString());
    } catch (e) {
      const pos = view.posAtCoords({ x: 0, y: 0 });
      if (pos !== null) {
        errors.push({
          from: pos,
          to: pos,
          severity: "error" as const,
          message: e instanceof Error ? e.message : "Error de sintaxis JSON"
        });
      }
    }
    return errors;
  });

  onMount(() => {
    if (editorRef) {
      const editor = new EditorView({
        doc: props.value,
        extensions: [
          basicSetup,
          json(),
          jsonLinter,
          lintGutter(),
          oneDark,
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              const text = update.state.doc.toString();
              try {
                JSON.parse(text);
                setIsValid(true);
                setError(null);
                props.onChange(text);
              } catch (e) {
                setIsValid(false);
                setError(e instanceof Error ? e.message : "Error de sintaxis JSON");
              }
            }
          })
        ],
        parent: editorRef
      });

      return () => editor.destroy();
    }
  });

  return (
    <div class="flex flex-col gap-2 w-full -ml-4">
      <div
        ref={editorRef}
        class={`w-full border rounded min-h-[400px] max-h-[600px] overflow-auto ${
          !isValid() ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
        } ${props.class || ""}`}
      />
      {!isValid() && (
        <div class="text-red-500 dark:text-red-400 text-sm">{error()}</div>
      )}
    </div>
  );
} 