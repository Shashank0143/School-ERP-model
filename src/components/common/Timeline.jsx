import React from 'react';
import { motion } from 'framer-motion';

const Timeline = ({ items, className = "" }) => {
  return (
    <div className={`relative pl-6 border-l-2 border-gray-100 space-y-6 ${className}`}>
      {items.map((item, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative"
        >
          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${item.color || 'bg-blue-400'}`} />
          <h4 className="font-bold text-[#03045e]">{item.title}</h4>
          {item.subtitle && (
            <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-wider">
              {item.subtitle}
            </p>
          )}
          {item.description && (
            <p className="text-xs text-gray-400 mt-1">
              {item.description}
            </p>
          )}
          {item.content && (
            <div className="mt-3">
              {item.content}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;
