import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-light-bg rounded-lg shadow-card ${sizes[size]} w-full mx-4 animate-slide-up`}
      >
        <div className="flex items-center justify-between p-6 border-b border-dark-bg">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
