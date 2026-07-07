import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentPreviewModal = ({ isOpen, onClose, title = "Document Preview", hidePrint = false, children }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-100 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden print:shadow-none print:w-auto print:max-w-none print:bg-white print:rounded-none"
        >
          {/* Header - Hidden on Print */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200 bg-white print:hidden">
            <h3 className="font-bold text-[#03045e] text-lg">{title}</h3>
            <div className="flex items-center gap-3">
              {!hidePrint && (
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#caf0f8] text-[#0077b6] hover:bg-[#90e0ef] rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  <Printer size={16} />
                  Print / Save PDF
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12 flex items-start justify-center overflow-auto max-h-[85vh] print:max-h-none print:overflow-visible print:p-4 print:m-0">
            {children}
          </div>
        </motion.div>

        {/* Global Print Styles injected only when modal is open */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .fixed, .fixed * {
              visibility: visible;
            }
            .fixed {
              position: absolute;
              left: 0;
              top: 0;
              background: transparent !important;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

export default DocumentPreviewModal;
