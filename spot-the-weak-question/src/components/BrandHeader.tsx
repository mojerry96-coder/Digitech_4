import { evaluator } from "../lib/evaluator";

type Props = { onReset: () => void };

export function BrandHeader({ onReset }: Props) {
  return (
    <header className="brand-header">
      <span className="brand-wordmark">Digi-Teach</span>
      <span className="brand-divider" aria-hidden="true" />
      <span className="brand-title">Spot the Weak Question</span>
      {evaluator.mode === "preview" && (
        <details className="preview-tools">
          <summary>Preview mode</summary>
          <div className="preview-panel">
            <p>
              <strong>Live AI assessment isn't connected.</strong> Redesign retests only work for the sample drafts
              listed under the editor, and fixes in the unaided challenge stay unassessed.
            </p>
            <p>In Lovable, connect the evaluate-question backend to replace this mode.</p>
            <button type="button" onClick={onReset}>
              Reset session and replay
            </button>
          </div>
        </details>
      )}
    </header>
  );
}
