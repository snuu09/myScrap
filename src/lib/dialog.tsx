import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AppDialog } from "../components/AppDialog";

export type DialogConfirmOpts = {
  title?: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type DialogState =
  | { kind: "alert"; message: string; title?: string }
  | { kind: "confirm"; opts: DialogConfirmOpts };

type DialogApi = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (bodyOrOpts: string | DialogConfirmOpts) => Promise<boolean>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    const resolve = resolver.current;
    resolver.current = null;
    setState(null);
    resolve?.(result);
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
      alert(message, title) {
        return new Promise((resolve) => {
          resolver.current = () => resolve();
          setState({ kind: "alert", message, title });
        });
      },
      confirm(bodyOrOpts) {
        const opts: DialogConfirmOpts =
          typeof bodyOrOpts === "string" ? { body: bodyOrOpts } : bodyOrOpts;
        return new Promise((resolve) => {
          resolver.current = resolve;
          setState({ kind: "confirm", opts });
        });
      },
    }),
    [],
  );

  return (
    <DialogContext.Provider value={api}>
      {children}
      <AppDialog state={state} onClose={close} />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog requires DialogProvider");
  return ctx;
}
