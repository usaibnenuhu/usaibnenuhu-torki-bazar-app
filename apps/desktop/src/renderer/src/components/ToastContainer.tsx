import { useToastStore } from "../store/toastStore";

const variantStyles: Record<string, string> = {
  success: "bg-brand-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-slate-800 text-white",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`min-w-[260px] rounded-lg px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 ${variantStyles[t.variant]}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
