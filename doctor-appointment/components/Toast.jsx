'use client';
import React, { useEffect } from 'react';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const styles = {
    success: {
      border: 'border-l-[#28a745]',
      text: 'text-[#155724]',
    },
    error: {
      border: 'border-l-[#dc3545]',
      text: 'text-[#721c24]',
    },
    info: {
      border: 'border-l-[#17a2b8]',
      text: 'text-[#0c5460]',
    },
  };

  const s = styles[toast.type] || styles.info;

  return (
    <div
      className={`pointer-events-auto bg-white py-4 px-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-between gap-5 min-w-[250px] font-medium text-[16px] border-l-[6px] ${s.border} ${s.text} animate-[slideIn_0.5s_ease]`}
    >
      <p className="m-0 leading-tight">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="bg-transparent border-none text-[18px] text-[#aaa] cursor-pointer hover:text-[#888] p-0 ml-auto"
      >
        ✖
      </button>
    </div>
  );
};

export default Toast;
