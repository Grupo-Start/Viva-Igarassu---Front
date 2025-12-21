import "./Button.css";

export function Button({ text, disabled, ...props }) {
  return (
    <button className="btn" disabled={disabled} {...props}>
      {text}
    </button>
  );
}

