import { useState } from "react";

function Alert({ children, type = "info" }) {
  const [visible, setVisible] = useState(true);
  
  const styles = {
    info: "bg-blue-50 text-blue-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    error: "bg-red-50 text-red-700",
  };

  if (!visible) return null;

  return (
    <div
      className={`flex items-center justify-between rounded-md px-4 py-3 text-sm ${styles[type]}`}
    >
      <span>{children}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 font-bold opacity-60 hover:opacity-100"
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  );
}
export default Alert;