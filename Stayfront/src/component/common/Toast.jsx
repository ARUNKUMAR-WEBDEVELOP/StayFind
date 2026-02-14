import React, { useEffect } from "react";

const stylesByType = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

export const Toast = ({ message, type = "success", duration = 2200, onClose }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const color = stylesByType[type] || stylesByType.info;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className={`${color} text-white px-4 py-2 rounded-lg shadow-lg text-sm`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
