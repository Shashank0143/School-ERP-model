import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = "md:w-[600px]", hideClose = false, headerGradient = "from-[#03045e] to-[#0077b6]" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`bg-white w-[95vw] ${maxWidth} rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#caf0f8]/30`}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className={`p-5 bg-gradient-to-r ${headerGradient} text-white flex justify-between items-center shrink-0`}>
                <div>
                  {title && <h3 className="text-base font-black tracking-tight uppercase tracking-wider">{title}</h3>}
                  {subtitle && <p className="text-[10px] text-blue-200 font-bold mt-0.5">{subtitle}</p>}
                </div>
                {!hideClose && onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
