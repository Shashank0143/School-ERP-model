import React from 'react';
import { Search } from 'lucide-react';

const SearchFilterBar = ({ 
  searchQuery, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  filters = [], 
  actions = null,
  className = ""
}) => {
  return (
    <div className={`p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-150 shadow-sm rounded-3xl bg-white ${className}`}>
      {onSearchChange && (
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-xl px-4 py-3 flex-1 w-full max-w-md focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs font-bold bg-transparent outline-none text-[#03045e] placeholder-gray-400"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end ml-auto">
        {filters.map((filter, i) => (
          <select
            key={i}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200/60 text-xs font-bold text-[#03045e] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%22//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto', paddingRight: '2.5rem' }}
          >
            {filter.options.map((opt, j) => (
              <option key={j} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default SearchFilterBar;
