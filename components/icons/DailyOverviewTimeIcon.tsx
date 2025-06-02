import React from 'react';

interface DailyOverviewTimeIconProps {
  className?: string;
  color?: string;
}

const DailyOverviewTimeIcon: React.FC<DailyOverviewTimeIconProps> = ({ className = "w-10 h-10", color = "#2A3B5A" }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    <path d="M20.0002 11.6667V20.0001H28.3335" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="20" r="2.5" fill={color}/>
  </svg>
);

export default DailyOverviewTimeIcon;