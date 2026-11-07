import { useEffect, useRef, type ReactNode } from "react";
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef(document.activeElement as HTMLElement);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger.current?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby="dialog-title" onCancel={onClose}>
      <div className="flex justify-between items-center gap-4">
        <h2 id="dialog-title">{title}</h2>
        <button autoFocus onClick={onClose} aria-label="Close dialog">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
