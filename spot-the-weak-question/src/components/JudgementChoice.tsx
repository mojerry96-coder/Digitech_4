import { CLASSIFICATION_LABEL, type Classification } from "../content/questions";

type Props = {
  name: string;
  value: Classification | null;
  onChange: (c: Classification) => void;
  inline?: boolean;
  disabled?: boolean;
};

/** Two neutral, equal-weight options. Selection means selected, never correct. */
export function JudgementChoice({ name, value, onChange, inline, disabled }: Props) {
  return (
    <fieldset className="choice-group controls-enter" disabled={disabled}>
      <legend className="field-label">Your judgement</legend>
      <div className={`choice-row${inline ? " choice-row--inline" : ""}`}>
        {(["vulnerable", "resilient"] as const).map((c) => (
          <label key={c} className="choice">
            <input type="radio" name={name} value={c} checked={value === c} onChange={() => onChange(c)} />
            {CLASSIFICATION_LABEL[c]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
