import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext({ addToast: () => {} })

let idSeq = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = idSeq++
    setToasts((arr) => [...arr, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }, [remove])

  const ctx = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed z-[9999] bottom-4 right-4 space-y-2 w-[calc(100%-2rem)] sm:w-96">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-lg shadow-soft p-3 text-sm border ${
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' :
              t.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
              'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
            <div className="flex items-start gap-2">
              <div className="flex-1">{t.message}</div>
              <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-gray-800">×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  return useContext(ToastContext)
}
