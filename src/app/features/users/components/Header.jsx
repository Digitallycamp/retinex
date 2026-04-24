import React from 'react'
import { Calendar } from 'lucide-react';
import SearchBar from './SearchBar';
import Button from './Button';
 
function Header({
  title, 
  description, 
  showDate = false,
  showSearch = false,
  showButton = false,
  searchValue = '',
  onSearchChange = () => {},
  searchPlaceholder = 'Search...',
  buttonText = '',
  ButtonIcon = null,
  onButtonClick = () => {},
  buttonVariant = 'primary',
  className = ""
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl ${className}`}>
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-1">{title}</h1>
          <p className="text-black/80 text-xs sm:text-sm lg:text-base">{description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
          {showDate && (
            <div className="bg-black/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-black/20 flex-1 lg:flex-none">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#3F0E40] flex-shrink-0" />
                <span className="text-black text-xs sm:text-sm font-medium truncate">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          )}
          
          {showSearch && (
            <SearchBar 
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          )}
          
          {showButton && (
            <Button 
              onClick={onButtonClick}
              Icon={ButtonIcon}
              variant={buttonVariant}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header