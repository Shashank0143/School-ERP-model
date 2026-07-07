import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Drawer = ({ isOpen, onClose, title, subtitle, children, width = "md:w-[450px]" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm print:hidden"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 bottom-0 w-full ${width} bg-white z-50 shadow-2xl border-l border-gray-100 flex flex-col print:hidden`}
          >
            {(title || subtitle) && (
              <div className="p-6 bg-gradient-to-br from-[#03045e] to-[#0077b6] text-white flex justify-between items-center shrink-0">
                <div>
                  {title && <h3 className="font-black text-lg">{title}</h3>}
                  {subtitle && (
                    <p className="text-xs text-blue-200 uppercase tracking-widest mt-1 font-bold">
                      {subtitle}
                    </p>
                  )}
                </div>
                {onClose && (
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
