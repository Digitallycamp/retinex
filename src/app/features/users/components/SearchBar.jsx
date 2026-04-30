import React from 'react'
import { Search } from 'lucide-react';

function SearchBar({
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "" 
}) {
  return (
      <div className={`relative flex-1 lg:flex-none ${className}`}>
      <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black/60" size={16} />
      <input 
        className="w-full lg:w-64 xl:w-72 pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-black/10 backdrop-blur-sm border border-black/20 rounded-xl text-sm outline-none placeholder:text-black/60 text-black focus:bg-white/20 focus:border-[#3F0E40]/50 transition-all"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default SearchBar