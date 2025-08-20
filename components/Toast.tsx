
import React, { useEffect, useState } from 'react';

interface ToastProps {
  toast: { message: string; key: number } | null;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (toast) {
      setMessage(toast.message);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-700 border border-slate-500 text-white rounded-lg shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {message}
    </div>
  );
};

export default Toast;