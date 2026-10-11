"use client";
import { useEffect, useId, useRef } from "react";
export function Dialogo({
  aberto,
  onClose,
  titulo,
  children,
}: {
  aberto: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !aberto) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, [aberto]);
  if (!aberto) return null;
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          onClose();
      }}
      className="superficie-elevada m-auto w-[calc(100%-32px)] max-w-lg rounded-ds-surface p-5 text-ink backdrop:bg-canvas/80"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-xl font-medium">
          {titulo}
        </h2>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="min-h-11 min-w-11 rounded-ds border border-hairline"
        >
          ×
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
