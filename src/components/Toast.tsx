import { useToast } from '../hooks';

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg backdrop-blur-md border transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-100'
              : toast.type === 'error'
              ? 'bg-red-500/20 border-red-500/50 text-red-100'
              : 'bg-blue-500/20 border-blue-500/50 text-blue-100'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
