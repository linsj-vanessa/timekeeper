import React from 'react';

interface HeaderTimekeeperIconProps {
  className?: string;
}

const HeaderTimekeeperIcon: React.FC<HeaderTimekeeperIconProps> = ({ className = "w-8 h-8" }) => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Outer Circle */}
    <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2"/>
    
    {/* Hands */}
    {/* Hour hand (to ~10 o'clock) */}
    <line x1="16" y1="16" x2="10.8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Minute hand (to ~2 o'clock) */}
    <line x1="16" y1="16" x2="22.5" y2="11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>

    {/* Tick Marks */}
    <line x1="16" y1="3" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> {/* 12 o'clock */}
    <line x1="29" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> {/* 3 o'clock */}
    <line x1="16" y1="29" x2="16" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> {/* 6 o'clock */}
    <line x1="3" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> {/* 9 o'clock */}
  </svg>
);

export default HeaderTimekeeperIcon;