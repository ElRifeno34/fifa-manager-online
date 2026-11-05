import { Fragment } from "react";

const NUMBER = /(\d+(?:[-:/.,]\d+)*)/g;

/** Sets every number found in a string in JetBrains Mono, leaving the words in Archivo. */
export function NumericText({ children }: { children: string }) {
  const parts = children.split(NUMBER);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono text-[0.92em] tracking-normal">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
