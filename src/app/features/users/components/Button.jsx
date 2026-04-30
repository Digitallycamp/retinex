import React from 'react'

function Button({
  onClick, 
  children, 
  Icon = null, 
  variant = "primary", 
  className = "" 
}) {
    const variants = {
    primary: "bg-[#3F0E40] text-white hover:shadow-[#3F0E40]/25 hover:bg-[#3F0E40]",
    secondary: "bg-black/10 backdrop-blur-sm text-black border border-black/20 hover:bg-black/20"
  };
  return (
    <button 
      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

export default Button