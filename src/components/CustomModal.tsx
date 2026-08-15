'use client';

import { useLockBodyScroll } from "@/data/hooks/useBodyLockScroll";
import { X } from "lucide-react";

interface CustomModalProps extends React.HTMLAttributes<HTMLElement> {
  title? : string;
  children?: React.ReactNode;
  modalOpen: boolean;
  className?: string;
  onClose?: () => void;
};

export default function CustomModal({ 
  title,
  modalOpen, 
  onClose, 
  children,
  className,
}: CustomModalProps) {
  useLockBodyScroll(modalOpen);

  if (!modalOpen) return null;

  return (
    <div 
      onClick={onClose}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center 
        bg-black/50 p-4 backdrop-blur-xs transition-all cursor-default
      `}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col gap-2 p-6 w-full max-w-md md:max-w-xl
          bg-zinc-800 text-zinc-200 rounded-lg shadow-xl ${className}
        `}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-muted-foreground/50 pb-4">
            <h2 className="text-lg font-bold text-zinc-200">
              {title}
            </h2>
            <button 
              type="button"
              aria-label="Fechar"
              title="Fechar"
              onClick={onClose} 
              className="cursor-pointer"
            >
              <X className="w-5 h-5 text-zinc-200 hover:text-gray-400 transition-colors" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};