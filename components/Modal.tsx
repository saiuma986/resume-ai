import React, { useEffect, useState } from 'react';
import { XIcon, MaximizeIcon, MinimizeIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  allowMaximize?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, allowMaximize = false }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
      setIsMaximized(false); // Reset maximization state on close
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isMaximized ? 'w-[95vw] h-[95vh] max-w-full max-h-full' : 'w-full max-w-4xl max-h-[90vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-neutral-200 px-6 py-4 flex justify-between items-center z-10 flex-shrink-0">
          <h2 id="modal-title" className="text-xl font-bold text-neutral-800 truncate pr-4">{title}</h2>
          <div className="flex items-center">
            {allowMaximize && (
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors mr-1"
                aria-label={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? <MinimizeIcon className="h-5 w-5" /> : <MaximizeIcon className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6 md:p-8 flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};